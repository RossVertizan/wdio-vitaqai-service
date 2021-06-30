"use strict";
//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
// import stringify = Mocha.utils.stringify;
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service');
const path = require("path");
// Packages
// @ts-ignore
const vitaqai_api_1 = require("vitaqai_api");
const webdriverio_1 = require("webdriverio");
const { DEFAULT_OPTIONS } = require("./defaults");
// TODO: Following line used for running tests - need to resolve this
// exports.VitaqService = class VitaqService implements Services.ServiceInstance {
module.exports = class VitaqService {
    constructor(serviceOptions, capabilities, config) {
        try {
            log.debug("serviceOptions: ", serviceOptions);
            log.debug("capabilities: ", capabilities);
            log.debug("config: ", config);
            this._capabilities = capabilities;
            this._config = config;
            // Compile the options
            // - preferentially from the command line in config
            // - then from the serviceOptions (specified in wdio.conf.js file)
            // - then from the defaults
            this._options = { ...DEFAULT_OPTIONS, ...serviceOptions, ...this._config };
            // Import either the Sync or Async versions of the functions
            if (this._options.useSync) {
                this.vitaqFunctions = require('./functionsSync');
            }
            else {
                this.vitaqFunctions = require('./functionsAsync');
            }
            // Process command line arguments
            this.booleanOptions = ['useSync', 'reloadSession', 'useCoverage', 'hitOnError', 'useAI', 'aiRandomSeed'];
            this.numericOptions = ['aiVariability', 'aiVariabilityDecay', 'noProgressStop'];
            this._suiteMap = {};
            this._activeSuites = [];
            // @ts-ignore
            global.vitaq = this;
            this._counter = 0;
            this.nextAction = "";
            this.nextActionJson = { actionName: "", message: "", overrideAction: "" };
            this.currentState = "passed";
            this.sessionReloadNeeded = false;
            this.errorMessage = "";
        }
        catch (error) {
            log.error("Error: Vitaq Service failed to initialise");
            log.error(error);
            // throw new Error("Vitaq Service failed to initialise");
            throw error;
        }
    }
    async nextActionSelector(suite, currentSuite) {
        let result = true;
        let returnSuite;
        // Create the suite map if it has not been created
        if (Object.keys(this._suiteMap).length < 1) {
            if (suite.root) {
                this.createSuiteMap(suite);
            }
        }
        // Accumulate the result first so we have one place that tracks the result
        // even if we have multiple suites in a file
        // - it starts as passed and can only ever go to failed
        if (typeof currentSuite !== "undefined") {
            if (currentSuite.ctx._runnable.state === "failed") {
                this.currentState = "failed";
            }
        }
        // Check if there are any remaining activeSuites, if so use the next suite
        if (this._activeSuites.length > 0) {
            // @ts-ignore
            return this.getSuite(suite, this._activeSuites.shift());
        }
        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // Map the passed/failed result to true and false
            log.info(`>>>>>   Test action ${this.nextAction} ${this.currentState}`);
            if (this.currentState === "passed") {
                result = true;
            }
            else if (this.currentState === "failed") {
                result = false;
            }
            else {
                log.error("ERROR: Unexpected value for currentState");
            }
        }
        // Send the result and get the next action
        if (suite.root) {
            // log.debug("VitaqService: nextActionSelector: This is the root suite");
            if (typeof currentSuite === "undefined") {
                log.debug("VitaqService: nextActionSelector: currentSuite is undefined");
                await this.getNextAction(undefined, result);
            }
            else {
                log.debug("VitaqService: nextActionSelector: currentSuite is: ", currentSuite.title);
                await this.getNextAction(currentSuite.title, result);
            }
            // Reset the current state to passed
            this.currentState = "passed";
            // Handle the special actions
            const specialActions = ['--*setUp*--', '--*tearDown*--', '--*EndSeed*--', '--*EndAll*--'];
            while (specialActions.indexOf(this.nextAction) > -1) {
                if (this.nextAction === '--*setUp*--') {
                    // Do a session reload if one is needed
                    if (this.sessionReloadNeeded) {
                        // @ts-ignore
                        await this._browser.reloadSession();
                    }
                    // Show which seed we are about to run
                    let seed = await this.vitaqFunctions.getSeed('top', this._browser, this._api);
                    log.info(`====================   Running seed: ${seed}   ====================`);
                    await this.getNextAction('--*setUp*--', true);
                    this.currentState = "passed";
                }
                else if (this.nextAction === '--*tearDown*--') {
                    // Do nothing on tearDown - just go to the next action
                    await this.getNextAction('--*tearDown*--', true);
                    this.currentState = "passed";
                }
                else if (this.nextAction === '--*EndSeed*--') {
                    if (Object.prototype.hasOwnProperty.call(this._options, "reloadSession")
                        && this._options.reloadSession) {
                        // Record the need for a session reload
                        // - avoids session reload on last seed
                        this.sessionReloadNeeded = true;
                    }
                    // Now get the next action
                    await this.getNextAction('--*EndSeed*--', true);
                    this.currentState = "passed";
                }
                else if (this.nextAction === '--*EndAll*--') {
                    // Just return null to indicate the test has finished
                    return null;
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
     * getNextAction - Wrapper for next action caller to handle additional data
     * i.e. message and overrideAction
     * @param lastActionName - the name of the lastAction
     * @param result - the result from the last action
     */
    async getNextAction(lastActionName, result) {
        this.nextActionJson = await this._api.getNextTestActionCaller(lastActionName, result);
        this.nextAction = this.nextActionJson.actionName;
        // Handle any message sent
        if (this.nextActionJson.message !== "") {
            log.error(this.nextActionJson.message);
        }
    }
    // -------------------------------------------------------------------------
    /**
     *
     * @param suite - The root suite that we will look through to find the sub-suite
     * @param suiteName - Name of the suite we are looking for
     * @returns {suite/null}
     */
    getSuite(suite, suiteName) {
        for (let index = 0; index < suite.suites.length; index += 1) {
            const subSuite = suite.suites[index];
            if (subSuite.fullTitle() === suiteName) {
                return subSuite;
            }
        }
        log.error("Was unable to find a test action script for: ", suiteName);
        log.info(`Make sure you have a test file with ${suiteName} as the text in the describe block`);
        log.info(`This will cause the test to end`);
        return null;
    }
    // -------------------------------------------------------------------------
    /**
     *
     * @param fileName - Name of the file which contains the suites to run
     * @returns {suites/null}
     */
    getSuitesFromFile(fileName) {
        if (Object.prototype.hasOwnProperty.call(this._suiteMap, fileName)) {
            return JSON.parse(JSON.stringify(this._suiteMap[fileName]));
        }
        log.error("Was unable to find a file for test action: ", fileName);
        log.info(`Make sure you have a test file with ${fileName} as the name of the file (excluding the extension)`);
        log.info(`This will cause the test to end`);
        return null;
    }
    // -------------------------------------------------------------------------
    /**
     * createSuiteMap - Create the mapping of the filename to the suites
     * @param suite - the root suite
     */
    createSuiteMap(suite) {
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
                this._suiteMap[filename].push(title);
            }
            else {
                this._suiteMap[filename] = [title];
            }
        }
        // log.debug("createSuiteMap: this._suiteMap: ", this._suiteMap)
    }
    /**
     * Provide a simple sleep command
     * @param duration
     */
    sleep(ms) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.sleep(ms, this._browser);
    }
    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHODS
    // -------------------------------------------------------------------------
    /**
     * Get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    requestData(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.requestData(variableName, this._browser, this._api);
    }
    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api);
    }
    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api);
    }
    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.readDataFromVitaq(variableName, this._browser, this._api);
    }
    /**
     * Create an entry in the Vitaq log
     * @param message - message/data to put into the log
     * @param format - format of the message/data, can be "text" (default) or "json"
     *
     * When using the JSON option the JSON data needs to be stringified using the
     * JSON.stringify() method
     */
    createVitaqLogEntry(message, format) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api);
    }
    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHOD ALIASES
    // -------------------------------------------------------------------------
    // Easier names to use with the Vitaq control methods
    // recordCoverage
    record(variablesArray) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api);
    }
    // sendDataToVitaq
    writeDataToVitaq(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api);
    }
    write(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api);
    }
    // readDataFromVitaq
    read(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.readDataFromVitaq(variableName, this._browser, this._api);
    }
    // createVitaqLogEntry
    log(message, format) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api);
    }
    // =============================================================================
    // Action Methods
    // =============================================================================
    abort(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.abort(actionName, this._browser, this._api);
    }
    addNext(actionName, nextAction, weight = 1) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.addNext(actionName, nextAction, weight, this._browser, this._api);
    }
    clearCallCount(actionName, tree) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.clearCallCount(actionName, tree, this._browser, this._api);
    }
    displayNextActions(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.displayNextActions(actionName, this._browser, this._api);
    }
    getCallCount(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getCallCount(actionName, this._browser, this._api);
    }
    getCallLimit(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getCallLimit(actionName, this._browser, this._api);
    }
    getEnabled(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getEnabled(actionName, this._browser, this._api);
    }
    getPrevious(actionName, steps = 1) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getPrevious(actionName, steps, this._browser, this._api);
    }
    getId(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getId(actionName, this._browser, this._api);
    }
    nextActions(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.nextActions(actionName, this._browser, this._api);
    }
    numberActiveNextActions(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.numberActiveNextActions(actionName, this._browser, this._api);
    }
    numberNextActions(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.numberNextActions(actionName, this._browser, this._api);
    }
    removeAllNext(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.removeAllNext(actionName, this._browser, this._api);
    }
    removeFromCallers(actionName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.removeFromCallers(actionName, this._browser, this._api);
    }
    removeNext(actionName, nextAction) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.removeNext(actionName, nextAction, this._browser, this._api);
    }
    setCallLimit(actionName, limit) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setCallLimit(actionName, limit, this._browser, this._api);
    }
    setEnabled(actionName, enabled) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setEnabled(actionName, enabled, this._browser, this._api);
    }
    setExhaustive(actionName, exhaustive) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setExhaustive(actionName, exhaustive, this._browser, this._api);
    }
    setMaxActionDepth(actionName, depth = 1000) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setMaxActionDepth(actionName, depth, this._browser, this._api);
    }
    // =============================================================================
    // Data Methods
    // =============================================================================
    allowList(variableName, list) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowList(variableName, list, this._browser, this._api);
    }
    allowOnlyList(variableName, list) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyList(variableName, list, this._browser, this._api);
    }
    allowOnlyRange(variableName, low, high) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyRange(variableName, low, high, this._browser, this._api);
    }
    allowOnlyValue(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyValue(variableName, value, this._browser, this._api);
    }
    allowOnlyValues(variableName, valueList) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyValues(variableName, valueList, this._browser, this._api);
    }
    allowRange(variableName, low, high) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowRange(variableName, low, high, this._browser, this._api);
    }
    allowValue(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowValue(variableName, value, this._browser, this._api);
    }
    allowValues(variableName, valueList) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowValues(variableName, valueList, this._browser, this._api);
    }
    disallowRange(variableName, low, high) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.disallowRange(variableName, low, high, this._browser, this._api);
    }
    disallowValue(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.disallowValue(variableName, value, this._browser, this._api);
    }
    disallowValues(variableName, valueList) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.disallowValues(variableName, valueList, this._browser, this._api);
    }
    doNotRepeat(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.doNotRepeat(variableName, value, this._browser, this._api);
    }
    gen(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.gen(variableName, this._browser, this._api);
    }
    getDoNotRepeat(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getDoNotRepeat(variableName, this._browser, this._api);
    }
    getSeed(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getSeed(variableName, this._browser, this._api);
    }
    getValue(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getValue(variableName, this._browser, this._api);
    }
    resetRanges(variableName) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.resetRanges(variableName, this._browser, this._api);
    }
    setSeed(variableName, seed) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setSeed(variableName, seed, this._browser, this._api);
    }
    setValue(variableName, value) {
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setValue(variableName, value, this._browser, this._api);
    }
    // =========================================================================
    // HOOKS
    //   Note: onPrepare, onWorkerStart and onComplete all run from the launcher
    // =========================================================================
    async beforeSession(config, capabilities) {
        // Runs
        log.info('Initialising the connection to Vitaq');
        log.debug("Running the vitaq-service beforeSession method");
        // Run up the Vitaq session
        try {
            this.formatCommandLineArgs();
            this._api = new vitaqai_api_1.VitaqAiApi(this._options);
            await this.waitForSession();
        }
        catch (error) {
            if (error === "script_failed") {
                this.errorMessage = "Failed to create test script";
            }
            else if (error === "failed") {
                this.errorMessage = "Failed to connect to Vitaq runner service - this may be a permissions problem";
            }
            else if (error === "timeout") {
                this.errorMessage = "Failed to connect to Vitaq runner service in timeout period - this may be a connectivity problem";
            }
            else {
                this.errorMessage = error.message;
            }
            log.error(this.errorMessage);
        }
    }
    // https://github.com/webdriverio/webdriverio/blob/master/examples/wdio.conf.js#L183-L326
    // before: function (capabilities, specs, browser) {
    async before(config, capabilities, browser) {
        this._browser = browser;
        log.debug("Running the vitaq-service before method");
        if (this.errorMessage !== "") {
            log.error("An error with the following message has already been detected");
            log.error(this.errorMessage);
            if (Object.prototype.hasOwnProperty.call(this, "_api") && this._api.sessionEstablishedError !== "") {
                log.error(this._api.sessionEstablishedError);
            }
            log.error("Please review the previous output for more details");
            await this._browser.deleteSession();
            // @ts-ignore
            delete this._browser.sessionId;
            process.exit(1);
        }
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
    waitForSession(delay = 100, timeout = 20000) {
        return new Promise((resolve, reject) => {
            let timeoutCounter = 0;
            let intervalId = setInterval(async () => {
                // Increment the timeoutCounter for a crude timeout
                timeoutCounter += delay;
                // log.debug('VitaqAiApi: waitForNextAction: this.nextTestAction: ', this.nextTestAction)
                if (this._api.sessionEstablished === "not_tried") {
                    await this._api.startPython();
                }
                else if (this._api.sessionEstablished === "success") {
                    clearInterval(intervalId);
                    resolve(this._api.sessionEstablished);
                }
                else if (this._api.sessionEstablished === "script_failed") {
                    clearInterval(intervalId);
                    reject(this._api.sessionEstablished);
                }
                else if (this._api.sessionEstablished === "failed") {
                    clearInterval(intervalId);
                    reject(this._api.sessionEstablished);
                }
                else if (timeoutCounter > timeout) {
                    log.error('Did not establish session in timeout period');
                    clearInterval(intervalId);
                    reject("timeout");
                }
            }, delay);
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
    createArgumentString(argumentsObject) {
        let argString = "";
        for (let index = 0; index < Object.keys(argumentsObject).length; index += 1) {
            if (index > 0) {
                argString += ", ";
            }
            argString += argumentsObject[index];
        }
        return argString;
    }
    formatCommandLineArgs() {
        // Start by checking what we have been passed
        this.checkUserData(this._options);
        // Start with converting Boolean like strings to booleans
        this._options = this.convertBooleanCommandLineArgs(this._options);
    }
    /**
     * checkUserData - check the data supplied by the user
     * @param options
     */
    checkUserData(options) {
        let key;
        // Start out by checking the booleans
        for (let index = 0; index < this.booleanOptions.length; index += 1) {
            key = this.booleanOptions[index];
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                if (this.convertToBool(options[key], true) === "not_bool") {
                    log.error(`The value provided for ${key} cannot be evaluated to a boolean - please use "true" or "false"`);
                    throw new webdriverio_1.SevereServiceError(`The value provided for ${key} cannot be evaluated to a boolean - please use "true" or "false"`);
                }
            }
        }
        // Check the numeric values
        for (let index = 0; index < this.numericOptions.length; index += 1) {
            key = this.numericOptions[index];
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                let value = options[key];
                if (isNaN(value) || isNaN(parseFloat(value))) {
                    log.error(`The value provided for ${key} cannot be evaluated to a number - please enter a number, got ${value}`);
                    throw new webdriverio_1.SevereServiceError(`The value provided for ${key} cannot be evaluated to a number - please enter a number, got ${value}`);
                }
                else if (key === 'aiVariability' || key === 'aiVariabilityDecay') {
                    if (parseFloat(value) < 1 || parseFloat(value) > 10) {
                        log.error(`The value provided for ${key} must be between 1 and 10, got ${value}`);
                        throw new webdriverio_1.SevereServiceError(`The value provided for ${key} must be between 1 and 10, got ${value}`);
                    }
                }
                else if (key === 'noProgressStop') {
                    if (parseInt(value, 10) < 1) {
                        log.error(`The value provided for ${key} must be greater than 1, got ${value}`);
                        throw new webdriverio_1.SevereServiceError(`The value provided for ${key} must be greater than 1, got ${value}`);
                    }
                }
            }
        }
        // Check the value of seed
        if (Object.prototype.hasOwnProperty.call(options, 'seed')) {
            let value = options['seed'];
            // Check that we only have 0-9, "," and "-"
            if (typeof value === 'string') {
                if (!value.match(/^[0-9,-]*$/)) {
                    log.error(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${value}`);
                    throw new webdriverio_1.SevereServiceError(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${value}`);
                }
                let entries = value.split(",");
                for (let index = 0; index < entries.length; index += 1) {
                    let entry = entries[index].trim();
                    if (!entry.match(/^[-]?[0-9]+$/) && !entry.match(/^[-]?[0-9]+-[-]?[0-9]+$/)) {
                        log.error(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${entry}`);
                        throw new webdriverio_1.SevereServiceError(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${entry}`);
                    }
                }
            }
        }
    }
    /**
     * convertBooleanCommandLineArgs - takes a dictionary like object and converts
     * the provided boolean keys to true or false
     * @param options - the dictionary (i.e. key/value) like object
     * @param booleanKeys - the keys with Boolean values
     */
    convertBooleanCommandLineArgs(options) {
        let key;
        for (let index = 0; index < this.booleanOptions.length; index += 1) {
            key = this.booleanOptions[index];
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                options[key] = this.convertToBool(options[key]);
            }
        }
        return options;
    }
    /**
     * convertToBool - take any string that looks as though the intention was "boolean"
     * and make it into boolean true or false
     * @param value - the value to convert
     * @param check - optional check to see of this looks like a boolean
     */
    convertToBool(value, check = false) {
        if (typeof (value) === 'string') {
            value = value.trim().toLowerCase();
        }
        else if (typeof (value) === 'undefined') {
            return value;
        }
        switch (value) {
            case true:
            case "true":
            case "1":
            case "on":
            case "yes":
                return true;
            case false:
            case "false":
            case "0":
            case "off":
            case "no":
                return false;
            default:
                return check ? "not_bool" : false;
        }
    }
};
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnRkFBZ0Y7QUFDaEYsaUNBQWlDO0FBQ2pDLGdGQUFnRjs7QUFFaEYsNENBQTRDO0FBRTVDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDMUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRTdCLFdBQVc7QUFDWCxhQUFhO0FBQ2IsNkNBQXdDO0FBQ3hDLDZDQUFnRDtBQVNoRCxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBRWpELHFFQUFxRTtBQUNyRSxrRkFBa0Y7QUFDbEYsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLFlBQVk7SUF1Qi9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsSUFBSTtZQUNBLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUd0QixzQkFBc0I7WUFDdEIsbURBQW1EO1lBQ25ELGtFQUFrRTtZQUNsRSwyQkFBMkI7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFDLEdBQUcsZUFBZSxFQUFFLEdBQUcsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDO1lBRXpF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