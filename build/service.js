"use strict";
//==============================================================================
// (c) Vertizan Limited 2011-2022
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
            // Define the debug presets for various timeouts
            const debugOptions = {
                authenticationTimeout: 60000,
                nextActionTimeout: 3600000,
                scriptTimeout: 60000,
                sessionTimeout: 60000
            };
            // Compile the options
            // - preferentially from the command line in config
            // - then from the serviceOptions (specified in wdio.conf.js file)
            // - then from the defaults
            if (this._config.debug) {
                // If we have been passed the debug option set true, then overwrite
                // defaults with the debug defaults
                this._options = { ...DEFAULT_OPTIONS, ...debugOptions,
                    ...serviceOptions, ...this._config };
            }
            else {
                this._options = { ...DEFAULT_OPTIONS, ...serviceOptions,
                    ...this._config };
            }
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
    // -------------------------------------------------------------------------
    /**
     * nextActionSelector - Go to Vitaq to select the next action
     * @param suite
     * @param currentSuite
     */
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
        // Print messages from the queue
        this.printMessages();
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
            // log.debug("nextActionSelector: This is the root suite");
            if (this.nextAction === "") {
                log.debug("nextActionSelector: nextAction is undefined");
                await this.getNextAction(undefined, result);
            }
            else {
                log.debug("nextActionSelector: Last action was: ", this.nextAction);
                await this.getNextAction(this.nextAction, result);
            }
            // Reset the current state to passed
            this.currentState = "passed";
            // Handle the special actions
            // Need to update vitaq_runner if any specialActions added
            const specialActions = ['--*setUp*--', '--*tearDown*--', '--*EndSeed*--', '--*EndAll*--'];
            while (specialActions.indexOf(this.nextAction) > -1) {
                // Print messages from the queue
                this.printMessages();
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
                    // Send result back to the API and return the response (which is null)
                    // ... to indicate that the test has finished
                    return await this.getNextAction('--*EndAll*--', true);
                }
            }
            // Now handle the real nextAction
            log.debug("nextActionSelector: Next action is: ", this.nextAction);
            log.info(`--------------------   Running test action: ${this.nextAction}   --------------------`);
            // Print messages from the queue
            this.printMessages();
            // Need to return the suite object
            this._activeSuites = this.getSuitesFromFile(this.nextAction);
            // @ts-ignore
            return this.getSuite(suite, this._activeSuites.shift());
        }
    }
    // -------------------------------------------------------------------------
    /**
     * getNextAction - Wrapper for next action caller
     *  - originally to handle additional data i.e. message and overrideAction
     * @param lastActionName - the name of the lastAction
     * @param result - the result from the last action
     */
    async getNextAction(lastActionName, result) {
        this.nextAction = await this._api.getNextTestActionCaller(lastActionName, result);
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
        log.error(`Was unable to find ${suiteName} in ${suite.fullTitle()}`);
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
        log.error(`Make sure you have a test file with ${fileName} as the name of the file (excluding the extension)`);
        log.error("The files that have been provided with defined tests are:");
        log.error(this._suiteMap);
        log.error(`This will cause the test to end`);
        this.deleteSession().then(() => { return null; });
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
    // -------------------------------------------------------------------------
    /**
     * printMessages - print all of the messages from the VitaqAI API messageQueue
     */
    printMessages() {
        let message;
        while (this._api.socket.messageQueue.length > 0) {
            message = this._api.socket.messageQueue.shift();
            if (message[0] === "info") {
                log.info(message[1]);
            }
            else if (message[0] === "error") {
                log.error(message[1]);
            }
            else if (message[0] === "warning") {
                log.warn(message[1]);
            }
            else {
                log.info(message[1]);
            }
        }
    }
    // -------------------------------------------------------------------------
    /**
     * Delete the session
     */
    async deleteSession() {
        // @ts-ignore
        await this._browser.deleteSession();
        // @ts-ignore
        delete this._browser.sessionId;
        process.exit(1);
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
        // Get the Vitaq script
        let scriptResult;
        try {
            this.formatCommandLineArgs();
            this._api = new vitaqai_api_1.VitaqAiApi(this._options);
            scriptResult = await this.waitForScript(this._options.scriptTimeout, 100);
        }
        catch (error) {
            if (error === "script_failed") {
                this.errorMessage = "Failed to create test script";
            }
            else if (error === "timeout") {
                this.errorMessage = "Failed to create test script in timeout period - there may be other output above";
            }
            else {
                this.errorMessage = error.message;
            }
            log.error(this.errorMessage);
        }
        // Run up the Vitaq session
        let sessionResult;
        if (scriptResult === "script_success") {
            try {
                sessionResult = await this.waitForSession(this._options.sessionTimeout, 100);
            }
            catch (error) {
                if (error === "failed") {
                    this.errorMessage = "Failed to connect to Vitaq runner service - this may be a permissions problem";
                }
                else if (error === "timeout") {
                    this.errorMessage = "Failed to connect to Vitaq runner service in timeout period - this may be a connectivity or authentication problem";
                }
                else {
                    this.errorMessage = error.message;
                }
                log.error(this.errorMessage);
            }
        }
    }
    // https://github.com/webdriverio/webdriverio/blob/master/examples/wdio.conf.js#L183-L326
    // before: function (capabilities, specs, browser) {
    async before(config, capabilities, browser) {
        this._browser = browser;
        log.debug("Running the vitaq-service before method");
        if (this.errorMessage !== "") {
            // Make sure we are getting any other messages sent our way
            // Print messages from the queue
            this.printMessages();
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
    async afterSession() {
        log.debug("Running the vitaq-service afterSession method");
        this._api.closeVitaq();
    }
    // onReload(oldSessionId:any, newSessionId:any) {
    //     // Runs on browser.reloadSession
    //     log.debug("Running the vitaq-service onReload method")
    // }
    // -------------------------------------------------------------------------
    /**
     * waitForScript - Wait for test activity script
     * @param delay - delay in checking
     * @param timeout - timeout
     */
    waitForScript(timeout = 20000, delay = 100) {
        return new Promise((resolve, reject) => {
            let timeoutCounter = 0;
            let intervalId = setInterval(async () => {
                // Increment the timeoutCounter for a crude timeout
                timeoutCounter += delay;
                // log.debug('waitForNextAction: this.nextTestAction: ', this.nextTestAction)
                if (this._api.sessionEstablished === "not_tried") {
                    await this._api.getTestScript();
                }
                else if (this._api.sessionEstablished === "script_success") {
                    log.info("Successfully generated Vitaq test script");
                    clearInterval(intervalId);
                    resolve(this._api.sessionEstablished);
                }
                else if (this._api.sessionEstablished === "script_failed") {
                    clearInterval(intervalId);
                    reject(this._api.sessionEstablished);
                }
                else if (timeoutCounter > timeout) {
                    log.error('Did not generate script in timeout period');
                    clearInterval(intervalId);
                    reject("timeout");
                }
            }, delay);
        });
    }
    // -------------------------------------------------------------------------
    /**
     * waitForSession - Wait for an established session with Vitaq
     * @param delay - delay in checking
     * @param timeout - timeout
     */
    waitForSession(timeout = 20000, delay = 100) {
        return new Promise((resolve, reject) => {
            let timeoutCounter = 0;
            let intervalId = setInterval(async () => {
                // Increment the timeoutCounter for a crude timeout
                timeoutCounter += delay;
                // log.debug('waitForNextAction: this.nextTestAction: ', this.nextTestAction)
                if (this._api.sessionEstablished === "script_success") {
                    await this._api.startVitaq();
                }
                else if (this._api.sessionEstablished === "success") {
                    log.info("Successfully started Vitaq");
                    clearInterval(intervalId);
                    resolve(this._api.sessionEstablished);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnRkFBZ0Y7QUFDaEYsaUNBQWlDO0FBQ2pDLGdGQUFnRjs7QUFFaEYsNENBQTRDO0FBRTVDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDMUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRTdCLFdBQVc7QUFDWCxhQUFhO0FBQ2IsNkNBQXdDO0FBQ3hDLDZDQUFnRDtBQWFoRCxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBRWpELHFFQUFxRTtBQUNyRSxrRkFBa0Y7QUFDbEYsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLFlBQVk7SUF1Qi9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBcUI7UUFFckIsSUFBSTtZQUNBLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QixnREFBZ0Q7WUFDaEQsTUFBTSxZQUFZLEdBQUc7Z0JBQ2pCLHFCQUFxQixFQUFFLEtBQUs7Z0JBQzVCLGlCQUFpQixFQUFFLE9BQU87Z0JBQzFCLGFBQWEsRUFBRSxLQUFLO2dCQUNwQixjQUFjLEVBQUUsS0FBSzthQUN4QixDQUFBO1lBRUQsc0JBQXNC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