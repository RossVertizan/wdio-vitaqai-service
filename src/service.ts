//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================

// import stringify = Mocha.utils.stringify;

const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service');
const path = require("path");

// Packages
// @ts-ignore
import { VitaqAiApi } from 'vitaqai_api'

// Type import
import type { Services, Capabilities, Options, Frameworks } from '@wdio/types'
import type { Browser, MultiRemoteBrowser } from 'webdriverio'

// Default options
import { VitaqServiceOptions, MochaSuite } from './types'
const { DEFAULT_OPTIONS } = require("./defaults")

module.exports = class VitaqService implements Services.ServiceInstance {
    private _options: VitaqServiceOptions
    private _capabilities: Capabilities.RemoteCapability
    private _config: Options.Testrunner
    private _counter: number
    private _api: VitaqAiApi
    private _browser?: Browser<'async'> | MultiRemoteBrowser<'async'>
    private _suiteMap: {[key: string]:string[]}
    private _activeSuites: string[]
    private vitaqFunctions
    private _sequenceName: string | undefined
    private nextAction: string
    private currentState: string
    private sessionReloadNeeded: boolean


    constructor(
        serviceOptions: VitaqServiceOptions,
        capabilities: Capabilities.RemoteCapability,
        config: Options.Testrunner
    ) {
        try {
            log.debug("serviceOptions: ", serviceOptions);
            log.debug("capabilities: ", capabilities);
            log.debug("config: ", config);
            this._capabilities = capabilities;
            this._config = config;

            // Convert command line booleans
            this.convertBooleanCommandLineArgs(this._config,
                ['useSync', 'reloadSession', 'useCoverage', 'hitOnError', 'useAI', 'aiRandomSeed'])

            // Compile the options
            // - preferentially from the command line in config
            // - then from the serviceOptions (specified in wdio.conf.js file)
            // - then from the defaults
            this._options = {...DEFAULT_OPTIONS, ...serviceOptions, ...this._config};

            // Import either the Sync or Async versions of the functions
            if (this._options.useSync) {
                this.vitaqFunctions = require('./functionsSync')
            } else {
                this.vitaqFunctions = require('./functionsAsync')
            }

            this._api = new VitaqAiApi(this._options)
            this._suiteMap = {};
            this._activeSuites = [];
            // @ts-ignore
            global.vitaq = this;
            this._counter = 0;
            this.nextAction = "";
            this.currentState = "passed";
            this.sessionReloadNeeded = false;

        } catch (error) {
            console.error("Error: Vitaq Service failed to initialise")
            console.error(error)
            throw new Error("Vitaq Service failed to initialise");
        }
    }

    async nextActionSelector(suite: MochaSuite, currentSuite: MochaSuite | undefined) {
        let result: boolean = true;
        let returnSuite: MochaSuite;

        // Create the suite map if it has not been created
        if (Object.keys(this._suiteMap).length < 1) {
            if (suite.root) {
                this.createSuiteMap(suite)
            }
        }

        // Accumulate the result first so we have one place that tracks the result
        // even if we have multiple suites in a file
        // - it starts as passed and can only ever go to failed
        if (typeof currentSuite !== "undefined") {
            if (currentSuite.ctx._runnable.state === "failed") {
                this.currentState = "failed"
            }
        }

        // Check if there are any remaining activeSuites, if so use the next suite
        if (this._activeSuites.length > 0){
            // @ts-ignore
            return this.getSuite(suite, this._activeSuites.shift());
        }

        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // Map the passed/failed result to true and false
            log.info(`>>>>>   Test action ${this.nextAction} ${this.currentState}`)
            if (this.currentState === "passed") {
                result = true;
            } else if (this.currentState === "failed") {
                result = false;
            } else {
                log.error("ERROR: Unexpected value for currentState")
            }
        }

        // Send the result and get the next action
        if (suite.root) {
            // log.debug("VitaqService: nextActionSelector: This is the root suite");

            if (typeof currentSuite === "undefined") {
                log.debug("VitaqService: nextActionSelector: currentSuite is undefined");
                this.nextAction = await this._api.getNextTestActionCaller(undefined, result);
                this.currentState = "passed"
            } else {
                log.debug("VitaqService: nextActionSelector: currentSuite is: ", currentSuite.title);
                this.nextAction = await this._api.getNextTestActionCaller(currentSuite.title, result);
                this.currentState = "passed"
            }

            // Handle the special actions
            const specialActions = ['--*setUp*--', '--*tearDown*--','--*EndSeed*--', '--*EndAll*--']
            while (specialActions.indexOf(this.nextAction) > -1) {
                if (this.nextAction === '--*setUp*--') {
                    // Do a session reload if one is needed
                    if (this.sessionReloadNeeded) {
                        // @ts-ignore
                        await this._browser.reloadSession()
                    }
                    // Show which seed we are about to run
                    let seed = await this.vitaqFunctions.getSeed('top', this._browser, this._api)
                    log.info(`====================   Running seed: ${seed}   ====================`)
                    this.nextAction = await this._api.getNextTestActionCaller('--*setUp*--', true);
                    this.currentState = "passed"
                }

                else if (this.nextAction === '--*tearDown*--') {
                    // Do nothing on tearDown - just go to the next action
                    this.nextAction = await this._api.getNextTestActionCaller('--*tearDown*--', true);
                    this.currentState = "passed"
                }

                else if (this.nextAction === '--*EndSeed*--') {
                    if (Object.prototype.hasOwnProperty.call(this._options, "reloadSession")
                        && this._options.reloadSession) {
                        // Record the need for a session reload
                        // - avoids session reload on last seed
                        this.sessionReloadNeeded = true
                    }
                    // Now get the next action
                    this.nextAction = await this._api.getNextTestActionCaller('--*EndSeed*--', true);
                    this.currentState = "passed"
                }

                else if (this.nextAction === '--*EndAll*--') {
                    // Just return null to indicate the test has finished
                    return null
                }
            }

            // Now handle the real nextAction
            log.info(`--------------------   Running test action: ${this.nextAction}   --------------------`);
            // Need to return the suite object
            this._activeSuites = this.getSuitesFromFile(this.nextAction);
            // @ts-ignore
            return this.getSuite(suite, this._activeSuites.shift());
        }
    }

    // -------------------------------------------------------------------------
    /**
     *
     * @param suite - The root suite that we will look through to find the sub-suite
     * @param suiteName - Name of the suite we are looking for
     * @returns {suite/null}
     */
    getSuite(suite: MochaSuite, suiteName: string) {
        for (let index = 0; index < suite.suites.length; index += 1) {
            const subSuite = suite.suites[index];
            if (subSuite.fullTitle() === suiteName) {
                return subSuite;
            }
        }
        console.error("Error: Was unable to find a test action script for: ", suiteName)
        console.warn(`Make sure you have a test file with ${suiteName} as the text in the describe block`)
        console.warn(`This will cause the test to end`)
        return null;
    }

    // -------------------------------------------------------------------------
    /**
     *
     * @param fileName - Name of the file which contains the suites to run
     * @returns {suites/null}
     */
    getSuitesFromFile(fileName: string) {
        if (Object.prototype.hasOwnProperty.call(this._suiteMap, fileName)) {
            return JSON.parse(JSON.stringify(this._suiteMap[fileName]))
        }
        console.error("Error: Was unable to find a file for test action: ", fileName);
        console.warn(`Make sure you have a test file with ${fileName} as the name of the file (excluding the extension)`);
        console.warn(`This will cause the test to end`);
        return null;
    }

    // -------------------------------------------------------------------------
    /**
     * createSuiteMap - Create the mapping of the filename to the suites
     * @param suite - the root suite
     */
    createSuiteMap(suite: MochaSuite): void {
        // log.debug("Running createSuiteMap")
        // log.debug("createSuiteMap: suites: ", suite.suites)
        // Foreach suite, get the filename and title
        let subSuite;
        let title;
        let filename;
        let filenameObj;
        for (let index = 0; index < suite.suites.length; index += 1) {
            subSuite = suite.suites[index];
            title = subSuite.title;
            filenameObj = path.parse(path.resolve(subSuite.file));
            filename = filenameObj.name;

            // Add to the suiteMap with file as the key and titles as an array
            if (Object.keys(this._suiteMap).indexOf(filename) > -1) {
                this._suiteMap[filename].push(title)
            } else {
                this._suiteMap[filename] = [title]
            }
        }
        // log.debug("createSuiteMap: this._suiteMap: ", this._suiteMap)
    }

    /**
     * Provide a simple sleep command
     * @param duration
     */
    sleep(ms: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.sleep(ms, this._browser)
    }

    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHODS
    // -------------------------------------------------------------------------
    /**
     * Get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    requestData(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.requestData(variableName, this._browser, this._api)
    }

    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray: []) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api)
    }

    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName: string, value: any) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api)
    }

    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.readDataFromVitaq(variableName, this._browser, this._api)
    }

    /**
     * Create an entry in the Vitaq log
     * @param message - message/data to put into the log
     * @param format - format of the message/data, can be "text" (default) or "json"
     *
     * When using the JSON option the JSON data needs to be stringified using the
     * JSON.stringify() method
     */
    createVitaqLogEntry(message: string | {}, format: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api)
    }

    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHOD ALIASES
    // -------------------------------------------------------------------------
    // Easier names to use with the Vitaq control methods

    // recordCoverage
    record(variablesArray: []) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api)
    }

    // sendDataToVitaq
    writeDataToVitaq(variableName: string, value: any) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api)
    }

    write(variableName: string, value: any) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api)
    }

    // readDataFromVitaq
    read(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.readDataFromVitaq(variableName, this._browser, this._api)
    }

    // createVitaqLogEntry
    log(message: string | {}, format: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api)
    }

// =============================================================================
// Action Methods
// =============================================================================

    abort(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.abort(actionName, this._browser, this._api)
    }

    addNext(actionName: string, nextAction: string, weight: number = 1) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.addNext(actionName, nextAction, weight, this._browser, this._api)
    }

    clearCallCount(actionName: string, tree: boolean) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.clearCallCount(actionName, tree, this._browser, this._api)
    }

    displayNextActions(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.displayNextActions(actionName, this._browser, this._api)
    }

    getCallCount(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getCallCount(actionName, this._browser, this._api)
    }

    getCallLimit(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getCallLimit(actionName, this._browser, this._api)
    }

    getEnabled(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getEnabled(actionName, this._browser, this._api)
    }

    getPrevious(actionName: string, steps: number = 1) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getPrevious(actionName, steps, this._browser, this._api)
    }

    getId(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getId(actionName, this._browser, this._api)
    }

    nextActions(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.nextActions(actionName, this._browser, this._api)
    }

    numberActiveNextActions(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.numberActiveNextActions(actionName, this._browser, this._api)
    }

    numberNextActions(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.numberNextActions(actionName, this._browser, this._api)
    }

    removeAllNext(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.removeAllNext(actionName, this._browser, this._api)
    }

    removeFromCallers(actionName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.removeFromCallers(actionName, this._browser, this._api)
    }

    removeNext(actionName: string, nextAction: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.removeNext(actionName, nextAction, this._browser, this._api)
    }

    setCallLimit(actionName: string, limit: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.setCallLimit(actionName, limit, this._browser, this._api)
    }

    setEnabled(actionName: string, enabled: boolean) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.setEnabled(actionName, enabled, this._browser, this._api)
    }

    setExhaustive(actionName: string, exhaustive: boolean) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.setExhaustive(actionName, exhaustive, this._browser, this._api)
    }

    setMaxActionDepth(actionName: string, depth: number = 1000) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.setMaxActionDepth(actionName, depth, this._browser, this._api)
    }

// =============================================================================
// Data Methods
// =============================================================================

    allowList(variableName: string, list: []) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowList(variableName, list, this._browser, this._api)
    }

    allowOnlyList(variableName: string, list: []) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowOnlyList(variableName, list, this._browser, this._api)
    }

    allowOnlyRange(variableName: string, low: number, high: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowOnlyRange(variableName, low, high, this._browser, this._api)
    }

    allowOnlyValue(variableName: string, value: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowOnlyValue(variableName, value, this._browser, this._api)
    }

    allowOnlyValues(variableName: string, valueList: []) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowOnlyValues(variableName, valueList, this._browser, this._api)
    }

    allowRange(variableName: string, low: number, high: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowRange(variableName, low, high, this._browser, this._api)
    }

    allowValue(variableName: string, value: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowValue(variableName, value, this._browser, this._api)
    }

    allowValues(variableName: string, valueList: []) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.allowValues(variableName, valueList, this._browser, this._api)
    }

    disallowRange(variableName: string, low: number, high: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.disallowRange(variableName, low, high, this._browser, this._api)
    }

    disallowValue(variableName: string, value: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.disallowValue(variableName, value, this._browser, this._api)
    }

    disallowValues(variableName: string, valueList: []) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.disallowValues(variableName, valueList, this._browser, this._api)
    }

    doNotRepeat(variableName: string, value: boolean) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.doNotRepeat(variableName, value, this._browser, this._api)
    }

    gen(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.gen(variableName, this._browser, this._api)
    }

    getDoNotRepeat(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getDoNotRepeat(variableName, this._browser, this._api)
    }

    getSeed(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getSeed(variableName, this._browser, this._api)
    }

    getValue(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.getValue(variableName, this._browser, this._api)
    }

    resetRanges(variableName: string) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.resetRanges(variableName, this._browser, this._api)
    }

    setSeed(variableName: string, seed: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.setSeed(variableName, seed, this._browser, this._api)
    }

    setValue(variableName: string, value: number) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`)
        return this.vitaqFunctions.setValue(variableName, value, this._browser, this._api)
    }

    // =========================================================================
    // HOOKS
    //   Note: onPrepare, onWorkerStart and onComplete all run from the launcher
    // =========================================================================
    async beforeSession (config: Options.Testrunner, capabilities: Capabilities.RemoteCapability) {
        // Runs
        log.info('Initialising the connection to Vitaq')
        log.debug("Running the vitaq-service beforeSession method")

        // Run up the Vitaq session
        try {
            await this.waitForSession();
        } catch (error) {
            console.error("Error: ", error)
        }
    }

    // https://github.com/webdriverio/webdriverio/blob/master/examples/wdio.conf.js#L183-L326
    // before: function (capabilities, specs, browser) {
    before(config: unknown, capabilities: unknown, browser: Browser<'async'> | MultiRemoteBrowser<'async'>) {
        this._browser = browser
        log.debug("Running the vitaq-service before method")
    }

    // beforeSuite(suite: Frameworks.Suite) {
    //     log.debug("Running the vitaq-service beforeSuite method")
    // }

    // beforeHook(test:any, context:any, stepData:any, world:any) {
    //     log.debug("Running the vitaq-service beforeHook method");
    // }

    // afterHook(test: never, context: never, results: Frameworks.TestResult){
    //     log.debug("Running the vitaq-service afterHook method")
    // }

    // beforeTest(test: Frameworks.Test, context:any) {
    //     log.debug("Running the vitaq-service beforeTest method")
    // }

    // beforeCommand(commandName:any, args:any) {
    //     log.debug("Running the vitaq-service beforeCommand method")
    // }

    // afterCommand(commandName:any, args:any, result:any, error:any) {
    //     log.debug("Running the vitaq-service afterCommand method")
    // }

    // afterTest(test: Frameworks.Test, context: unknown, results: Frameworks.TestResult) {
    //     log.debug("Running the vitaq-service afterTest method")
    // }

    // afterSuite(suite: Frameworks.Suite) {
    //     log.debug("Running the vitaq-service afterSuite method")
    // }

    // after(result: number) {
    //     log.debug("Running the vitaq-service after method")
    // }

    // afterSession(config: Options.Testrunner, capabilities: Capabilities.RemoteCapability, specs:any) {
    //     log.debug("Running the vitaq-service afterSession method")
    // }

    // onReload(oldSessionId:any, newSessionId:any) {
    //     // Runs on browser.reloadSession
    //     log.debug("Running the vitaq-service onReload method")
    // }

    // -------------------------------------------------------------------------
    /**
     * waitForSession - Wait for an established session with the Python job
     * @param delay - delay in checking
     * @param timeout - timeout
     */
    waitForSession(delay=100, timeout=20000) {
        return new Promise((resolve, reject) => {
            let timeoutCounter = 0;
            let intervalId = setInterval( async () => {

                // Increment the timeoutCounter for a crude timeout
                timeoutCounter += delay;
                // console.log('VitaqAiApi: waitForNextAction: this.nextTestAction: ', this.nextTestAction)

                if (this._api.sessionEstablished === "not_tried") {
                    await this._api.startPython()
                } else if (this._api.sessionEstablished === "success") {
                    clearInterval(intervalId)
                    resolve(this._api.sessionEstablished)
                } else if (this._api.sessionEstablished === "failed") {
                    clearInterval(intervalId)
                    reject(this._api.sessionEstablished)
                } else if (timeoutCounter > timeout) {
                    console.error('service: waitForSession: Did not establish session in timeout period')
                    clearInterval(intervalId)
                    reject("Timed Out")
                }
            }, delay)
        });
    }

    // // Cucumber specific hooks
    // // ======================================================================
    // beforeFeature: function (uri, feature, scenarios) {}
    // beforeScenario: function (uri, feature, scenario, sourceLocation) {}
    // beforeStep: function ({ uri, feature, step }, context) {}
    // afterStep: function ({ uri, feature, step }, context, { error, result, duration, passed, retries }) {}
    // afterScenario: function (uri, feature, scenario, result, sourceLocation) {}
    // afterFeature: function (uri, feature, scenarios) {}

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================
    getFuncName() {
        // @ts-ignore
        return (new Error()).stack.match(/at (\S+)/g)[1].slice(3).replace("VitaqService.", "");
    }

    createArgumentString(argumentsObject: IArguments) {
        let argString = "";
        for (let index = 0; index < Object.keys(argumentsObject).length; index += 1) {
            if (index > 0) {
                argString += ", "
            }
            argString += argumentsObject[index]
        }
        return argString
    }

    /**
     * convertBooleanCommandLineArgs - takes a dictionary like object and converts
     * the provided boolean keys to true or false
     * @param object - the dictionary (i.e. key/value) like object
     * @param booleanKeys - the keys with Boolean values
     */
    convertBooleanCommandLineArgs(object: {[key: string]:any}, booleanKeys: string[]) {
        let key: string;
        for (let index = 0; index < booleanKeys.length; index += 1) {
            key = booleanKeys[index]
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                object[key] = this.isTrue(object[key])
            }
        }

    }

    /**
     * isTrue - take any string that looks as though the intention was "true"
     * and make it into boolean true
     * @param value
     */
    isTrue(value: string | undefined){
        if (typeof(value) === 'string'){
            value = value.trim().toLowerCase();
        } else if (typeof(value) === 'undefined'){
            return value
        }
        switch(value){
            case "true":
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
    }
}

// =============================================================================
// END OF FILE
// =============================================================================
