//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================

const { VitaqService } = require("../build/service");
const { SevereServiceError } = require('webdriverio');

// beforeEach(() => {
//     // Create a VitaqAiSocketClient object without running the constructor
//     socketClient = Object.create(VitaqAiSocketClient.prototype);
// })

describe('convertToBool', () => {
    let result;
    let vs = new VitaqService()

    test('it should identify true-like arguments', async () => {
        result = vs.convertToBool(true)
        expect(result).toBe(true);
        result = vs.convertToBool('true')
        expect(result).toBe(true);
        result = vs.convertToBool('tRUe')
        expect(result).toBe(true);
        result = vs.convertToBool('yEs')
        expect(result).toBe(true);
        result = vs.convertToBool('oN')
        expect(result).toBe(true);
        result = vs.convertToBool('1')
        expect(result).toBe(true);
    })
    test('it should identify false-like arguments', async () => {
        result = vs.convertToBool(false)
        expect(result).toBe(false);
        result = vs.convertToBool('false')
        expect(result).toBe(false);
        result = vs.convertToBool('fALSe')
        expect(result).toBe(false);
        result = vs.convertToBool('nO')
        expect(result).toBe(false);
        result = vs.convertToBool('oFf')
        expect(result).toBe(false);
        result = vs.convertToBool('0')
        expect(result).toBe(false);
    })
    test('it should return false for unidentified arguments', async () => {
        result = vs.convertToBool({})
        expect(result).toBe(false);
        result = vs.convertToBool('something')
        expect(result).toBe(false);
        result = vs.convertToBool('hORSe')
        expect(result).toBe(false);
        result = vs.convertToBool('cOw')
        expect(result).toBe(false);
        result = vs.convertToBool('9')
        expect(result).toBe(false);
        result = vs.convertToBool('154')
        expect(result).toBe(false);
    })
    test('it should return undefined for undefined arguments', async () => {
        result = vs.convertToBool(undefined)
        expect(result).toBe(undefined);
    })
    test('it should return not_bool for unidentified arguments in check mode', async () => {
        result = vs.convertToBool({}, true)
        expect(result).toBe("not_bool");
        result = vs.convertToBool('something', true)
        expect(result).toBe("not_bool");
        result = vs.convertToBool('hORSe', true)
        expect(result).toBe("not_bool");
        result = vs.convertToBool('cOw', true)
        expect(result).toBe("not_bool");
        result = vs.convertToBool('9', true)
        expect(result).toBe("not_bool");
        result = vs.convertToBool('154', true)
        expect(result).toBe("not_bool");
    })
})

describe('convertBooleanCommandLineArgs', () => {
    let result;
    let vs = new VitaqService()
    let options = {}
    let expectedResult;

    test('it should convert true-like arguments that are booleans', async () => {
        options = {
            'useSync': 'yEs',
            'reloadSession': true,
            'useCoverage': "true",
            'hitOnError': "1",
            'useAI': "On",
            'spoofParam': "TRUE"
        }
        result = vs.convertBooleanCommandLineArgs(options)
        expectedResult = {
            'useSync': true,
            'reloadSession': true,
            'useCoverage': true,
            'hitOnError': true,
            'useAI': true,
            'spoofParam': "TRUE"
        }
        expect(result).toStrictEqual(expectedResult);
    })

    test('it should convert false-like arguments that are booleans', async () => {
        options = {
            'useSync': 'No',
            'reloadSession': false,
            'useCoverage': "false",
            'hitOnError': "0",
            'useAI': "Off",
            'spoofParam': "FALSE"
        }
        result = vs.convertBooleanCommandLineArgs(options)
        expectedResult = {
            'useSync': false,
            'reloadSession': false,
            'useCoverage': false,
            'hitOnError': false,
            'useAI': false,
            'spoofParam': "FALSE"
        }
        expect(result).toStrictEqual(expectedResult);
    })

    test('it should leave undefined arguments that are booleans', async () => {
        options = {
            'useSync': 'No',
            'reloadSession': undefined,
            'useCoverage': "false",
            'hitOnError': undefined,
            'useAI': "Off",
            'spoofParam': "FALSE"
        }
        result = vs.convertBooleanCommandLineArgs(options)
        expectedResult = {
            'useSync': false,
            'reloadSession': undefined,
            'useCoverage': false,
            'hitOnError': undefined,
            'useAI': false,
            'spoofParam': "FALSE"
        }
        expect(result).toStrictEqual(expectedResult);
    })
})

describe('checkUserData', () => {
    // https://stackoverflow.com/a/46155381/4945676
    let vs = new VitaqService()
    let options = {}

    test('it should check that the boolean parameters look like booleans - passing', async () => {
        options = {
            'useSync': 'yEs',
            'reloadSession': true,
            'useCoverage': "true",
            'hitOnError': "0",
            'useAI': "Off",
            'spoofParam': "FALSE"
        }
        const result = () => {
            vs.checkUserData(options)
        }
        expect(result).not.toThrow(SevereServiceError);
    })
    test('it should check that the boolean parameters look like booleans - failing', async () => {
        options = {
            'useSync': 'yEs',
            'reloadSession': true,
            'useCoverage': "ture",
            'hitOnError': "0",
            'useAI': "Off",
            'spoofParam': "FALSE"
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for useCoverage cannot be evaluated to a boolean - please use "true" or "false"');
        }
    })
    test('it should check that the numeric parameters look like numbers - passing', async () => {
        options = {
            'aiVariability': "3.414235647586",
            'aiVariabilityDecay': "7.645",
            'noProgressStop': "5"
        }

        const result = () => {
            vs.checkUserData(options)
        }
        expect(result).not.toThrow(SevereServiceError);
    })
    test('it should check that the numeric parameters look like numbers - failing', async () => {
        options = {
            'aiVariability': "3.414235647586",
            'aiVariabilityDecay': "7.G45",
            'noProgressStop': "5"
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for aiVariabilityDecay cannot be evaluated to a number - please enter a number, got 7.G45');
        }
    })
    test('it should check that the AI parameters are between 1 and 10 - above', async () => {
        options = {
            'aiVariability': "34.14235647586",
            'aiVariabilityDecay': "7.645",
            'noProgressStop': "5"
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for aiVariability must be between 1 and 10, got 34.14235647586');
        }
    })
    test('it should check that the AI parameters are between 1 and 10 - below', async () => {
        options = {
            'aiVariability': "3.414235647586",
            'aiVariabilityDecay': "0.7645",
            'noProgressStop': "5"
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for aiVariabilityDecay must be between 1 and 10, got 0.7645');
        }
    })
    test('it should check that the no progress stop parameter is greater than 1', async () => {
        options = {
            'aiVariability': "3.414235647586",
            'aiVariabilityDecay': "7.645",
            'noProgressStop': "0.9"
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for noProgressStop must be greater than 1, got 0.9');
        }
    })
    test('it should check that the seed parameter is valid - valid', async () => {
        options = {
            'seed': "1-9,10,11,12,13,14-25",
        }
        const result = () => {
            vs.checkUserData(options)
        }
        expect(result).not.toThrow(SevereServiceError);
    })
    test('it should check that the seed parameter is valid - valid (negatives)', async () => {
        options = {
            'seed': "-1--9,10,11,12,13,14-25",
        }
        const result = () => {
            vs.checkUserData(options)
        }
        expect(result).not.toThrow(SevereServiceError);
    })
    test('it should check that the seed parameter is valid - invalid space', async () => {
        options = {
            'seed': "1-9,10, 11,12,13,14-25",
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got 1-9,10, 11,12,13,14-25');
        }
    })
    test('it should check that the seed parameter is valid - invalid character', async () => {
        options = {
            'seed': "1-9,10,11;12,13,14-25",
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got 1-9,10,11;12,13,14-25');
        }
    })

    test('it should check that the seed parameter is valid - repeated dash', async () => {
        options = {
            'seed': "1---9,10,11,12,13,14-25",
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got 1---9');
        }
    })

    test('it should check that the seed parameter is valid - repeated dash on single value', async () => {
        options = {
            'seed': "--9",
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got --9');
        }
    })

    test('it should check that the seed parameter is valid - empty value', async () => {
        options = {
            'seed': "1--9,10,11,,12,13,14-25",
        }
        expect.assertions(2);
        try {
            vs.checkUserData(options)
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ');
        }
    })
})

describe('formatCommandLineArgs', () => {
    let vs = new VitaqService()
    let options = {}
    let expectedResult = {};

    test('it should format the command line args - passing', async () => {
        options = {
            'useSync': 'yEs',
            'reloadSession': true,
            'useCoverage': "true",
            'hitOnError': "0",
            'useAI': "Off",
            'aiRandomSeed': "No",
            'spoofParam': "FALSE",
            'aiVariability': "3.414235647586",
            'aiVariabilityDecay': "7.645",
            'noProgressStop': "6",
            'seed': "1--9,10,11,12,13,14-25"
        }
        vs._options = options
        vs.formatCommandLineArgs()
        expectedResult = {
            'useSync': true,
            'reloadSession': true,
            'useCoverage': true,
            'hitOnError': false,
            'useAI': false,
            'aiRandomSeed': false,
            'spoofParam': "FALSE",
            'aiVariability': "3.414235647586",
            'aiVariabilityDecay': "7.645",
            'noProgressStop': "6",
            'seed': "1--9,10,11,12,13,14-25"
        }
        expect(vs._options).toStrictEqual(expectedResult);
    })
    test('it should format the command line args - failing - invalid seed', async () => {
        options = {
            'useSync': 'yEs',
            'reloadSession': true,
            'useCoverage': "true",
            'hitOnError': "0",
            'useAI': "Off",
            'aiRandomSeed': "No",
            'spoofParam': "FALSE",
            'aiVariability': "3.414235647586",
            'aiVariabilityDecay': "7.645",
            'noProgressStop': "6",
            'seed': "1--9,10,11,12,13,14-25,--30"
        }
        vs._options = options
        expect.assertions(2);
        try {
            vs.formatCommandLineArgs()
        } catch (error) {
            expect(error).toBeInstanceOf(SevereServiceError);
            expect(error).toHaveProperty('message', 'The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got --30');
        }
    })
})

