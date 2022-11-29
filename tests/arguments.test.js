//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================

import {countNonOptionalArguments,
    countArgumentsReceived,
    checkArgumentTypes,
    validateArguments} from "../build/esm/arguments";
import { test, describe, expect } from 'vitest';

describe('countNonOptionalArguments', () => {
    let result;

    test('it should count the number of arguments', async () => {
        result = countNonOptionalArguments({})
        expect(result).toBe(0);
        result = countNonOptionalArguments({"argOne": "string"})
        expect(result).toBe(1);
        result = countNonOptionalArguments({"argOne": "string", "argTwo": "number"})
        expect(result).toBe(2);
        result = countNonOptionalArguments({"argOne": "string", "argTwo": "number", "argThree": "array"})
        expect(result).toBe(3);
        result = countNonOptionalArguments({"argOne": "string", "argTwo": "number", "argThree": "array", "argFour": "object"})
        expect(result).toBe(4);
        result = countNonOptionalArguments({"argOne": "string", "argTwo": "number", "argThree": "array", "argFour": "object", "argFive": "number"})
        expect(result).toBe(5);
    })

    test('it should not count optional arguments', async () => {
        result = countNonOptionalArguments({})
        expect(result).toBe(0);
        result = countNonOptionalArguments({"argOne": "string"})
        expect(result).toBe(1);
        result = countNonOptionalArguments({"argOne": "string", "argTwo?": "number"})
        expect(result).toBe(1);
        result = countNonOptionalArguments({"argOne": "string", "argTwo?": "number", "argThree?": "array"})
        expect(result).toBe(1);
        result = countNonOptionalArguments({"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"})
        expect(result).toBe(2);
        result = countNonOptionalArguments({"argOne?": "string", "argTwo?": "number", "argThree?": "array", "argFour?": "object", "argFive?": "number"})
        expect(result).toBe(0);
    })
})


describe('countArgumentsReceived', () => {
    let result;

    test('it should count the arguments in the array', async () => {
        result = countArgumentsReceived(["a", "b", "c", "d"])
        expect(result).toBe(4);
        result = countArgumentsReceived([])
        expect(result).toBe(0);
        result = countArgumentsReceived(["a", "b"])
        expect(result).toBe(2);
        result = countArgumentsReceived(["a", "b", undefined, undefined])
        expect(result).toBe(2);
    })
})

describe('checkArgumentTypes', () => {
    let result;

    test('it should check the types of the arguments', async () => {
        let receivedError;
        try {
            checkArgumentTypes("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                ["hello", 3, ["a", "b"], {"obj": 2}])
            receivedError = {message: "All OK", name: "All OK"}
        } catch(error) {
            receivedError = error;
        }
        expect(receivedError.message).toBe("All OK")
        expect(receivedError.name).toBe("All OK")

        try {
            checkArgumentTypes("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                [1, 3, ["a", "b"], {"obj": 2}])
            receivedError = {message: "All OK", name: "All OK"}
        } catch(error) {
            receivedError = error;
        }
        expect(receivedError.message).toBe("Argument 1 of TestFunction is expected to be of type string")
        expect(receivedError.name).toBe("VitaqServiceError")

        try {
            checkArgumentTypes("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                ["hello", "3", ["a", "b"], {"obj": 2}])
            receivedError = {message: "All OK", name: "All OK"}
        } catch(error) {
            receivedError = error;
        }
        expect(receivedError.message).toBe("Argument 2 of TestFunction is expected to be of type number")
        expect(receivedError.name).toBe("VitaqServiceError")

        try {
            checkArgumentTypes("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                ["hello", 3, {one: "a", two: "b"}, {"obj": 2}])
            receivedError = {message: "All OK", name: "All OK"}
        } catch(error) {
            receivedError = error;
        }
        expect(receivedError.message).toBe("Argument 3 of TestFunction is expected to be of type array")
        expect(receivedError.name).toBe("VitaqServiceError")

        try {
            checkArgumentTypes("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                ["hello", 3, ["a", "b"], "object"])
            receivedError = {message: "All OK", name: "All OK"}
        } catch(error) {
            receivedError = error;
        }
        expect(receivedError.message).toBe("Argument 4 of TestFunction is expected to be of type object")
        expect(receivedError.name).toBe("VitaqServiceError")

        try {
            checkArgumentTypes("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                ["hello", 3, ["a", "b"], undefined])
            receivedError = {message: "All OK", name: "All OK"}
        } catch(error) {
            receivedError = error;
        }
        expect(receivedError.message).toBe("Argument 4 of TestFunction is a required argument but is undefined")
        expect(receivedError.name).toBe("VitaqServiceError")

        try {
            checkArgumentTypes("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                ["hello", 3, undefined, {"obj": 2}])
            receivedError = {message: "All OK", name: "All OK"}
        } catch(error) {
            receivedError = error;
        }
        expect(receivedError.message).toBe("All OK")
        expect(receivedError.name).toBe("All OK")
    })
})

describe('validateArguments', () => {
    let result;

    test('it should remove undefined optional arguments without error', async () => {
        let result;
        try {
            result = validateArguments("TestFunction",
                {"argOne?": "string", "argTwo": "number", "argThree?": "array", "argFour": "object"},
                ["hello", 3, undefined, {"obj": 2}])
        } catch(error) {
            result = error;
        }
        expect(result).toStrictEqual(["hello", 3, {"obj": 2}])
    })
})
