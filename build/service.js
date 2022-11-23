//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import path from 'path';
import logger from '@wdio/logger';
// import stringify = Mocha.utils.stringify;
// const logger = require('@wdio/logger').default;
// const path = require("path");
// Packages
// @ts-ignore
import { VitaqAiApi } from 'vitaqai-api';
import { SevereServiceError } from 'webdriverio';
const log = logger('wdio-vitaqai-service');
const { DEFAULT_OPTIONS } = require("./defaults");
// TODO: Following line used for running tests - need to resolve this
// exports.VitaqService = class VitaqService implements Services.ServiceInstance {
export default class VitaqService {
    _options;
    _capabilities;
    _config;
    _counter;
    _api;
    _browser;
    _suiteMap;
    _activeSuites;
    vitaqFunctions;
    _sequenceName;
    nextActionJson;
    nextAction;
    currentState;
    sessionReloadNeeded;
    errorMessage;
    booleanOptions;
    numericOptions;
    _errors;
    _warnings;
    constructor(serviceOptions, capabilities, config) {
        this._errors = [];
        this._warnings = [];
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
            this._errors.push("Error: Vitaq Service failed to initialise");
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
        // let returnSuite: MochaSuite;
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
            const currentSuiteStates = currentSuite.tests.map(test => test.state);
            log.debug("currentSuite pass/fail states: ", currentSuiteStates);
            if (currentSuiteStates.indexOf('failed') > -1) {
                this.currentState = "failed";
            }
            // if (currentSuite.ctx._runnable.state === "failed") {
            //     this.currentState = "failed"
            // }
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
                log.error("Unexpected value for currentState");
                this._errors.push("Unexpected value for currentState");
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
        this._errors.push(`Was unable to find ${suiteName} in ${suite.fullTitle()}`);
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
        this._errors.push("Was unable to find a file for test action: ", fileName);
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
            if (typeof subSuite.file !== 'undefined' && typeof subSuite.title !== 'undefined') {
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
            else {
                log.debug("createSuiteMap: subSuite.file and/or subSuite.title is undefined: ", subSuite);
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
        if (this._api.socket) {
            while (this._api.socket.messageQueue.length > 0) {
                message = this._api.socket.messageQueue.shift();
                if (message[0] === "info") {
                    log.info(message[1]);
                }
                else if (message[0] === "error") {
                    log.error(message[1]);
                    this._errors.push(message[1]);
                }
                else if (message[0] === "warning") {
                    log.warn(message[1]);
                    this._warnings.push(message[1]);
                }
                else {
                    log.info(message[1]);
                }
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
            this._api = new VitaqAiApi(this._options);
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
            this._errors.push(this.errorMessage);
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
                this._errors.push(this.errorMessage);
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
            this._errors.push(this.errorMessage);
            if (Object.prototype.hasOwnProperty.call(this, "_api") && this._api.sessionEstablishedError !== "") {
                log.error(this._api.sessionEstablishedError);
                this._errors.push(this._api.sessionEstablishedError);
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
        if (this._errors.length > 0) {
            log.error("===============================================================");
            log.error("Errors encountered during run:");
            this._errors.forEach(error => {
                log.error(`  - ${error}`);
            });
            log.error("===============================================================\n");
        }
        if (this._warnings.length > 0) {
            log.warn("===============================================================");
            log.warn("Warnings encountered during run:");
            this._warnings.forEach(warning => {
                log.warn(`  - ${warning}`);
            });
            log.warn("===============================================================\n");
        }
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
                    this._errors.push('Did not generate script in timeout period');
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
                    this._errors.push('Did not establish session in timeout period');
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
                    this._errors.push(`The value provided for ${key} cannot be evaluated to a boolean - please use "true" or "false"`);
                    throw new SevereServiceError(`The value provided for ${key} cannot be evaluated to a boolean - please use "true" or "false"`);
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
                    this._errors.push(`The value provided for ${key} cannot be evaluated to a number - please enter a number, got ${value}`);
                    throw new SevereServiceError(`The value provided for ${key} cannot be evaluated to a number - please enter a number, got ${value}`);
                }
                else if (key === 'aiVariability' || key === 'aiVariabilityDecay') {
                    if (parseFloat(value) < 1 || parseFloat(value) > 10) {
                        log.error(`The value provided for ${key} must be between 1 and 10, got ${value}`);
                        this._errors.push(`The value provided for ${key} must be between 1 and 10, got ${value}`);
                        throw new SevereServiceError(`The value provided for ${key} must be between 1 and 10, got ${value}`);
                    }
                }
                else if (key === 'noProgressStop') {
                    if (parseInt(value, 10) < 1) {
                        log.error(`The value provided for ${key} must be greater than 1, got ${value}`);
                        this._errors.push(`The value provided for ${key} must be greater than 1, got ${value}`);
                        throw new SevereServiceError(`The value provided for ${key} must be greater than 1, got ${value}`);
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
                    this._errors.push(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${value}`);
                    throw new SevereServiceError(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${value}`);
                }
                let entries = value.split(",");
                for (let index = 0; index < entries.length; index += 1) {
                    let entry = entries[index].trim();
                    if (!entry.match(/^[-]?[0-9]+$/) && !entry.match(/^[-]?[0-9]+-[-]?[0-9]+$/)) {
                        log.error(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${entry}`);
                        this._errors.push(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${entry}`);
                        throw new SevereServiceError(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${entry}`);
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
}
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGO0FBQ2hGLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUN2QixPQUFPLE1BQU0sTUFBTSxjQUFjLENBQUE7QUFFakMsNENBQTRDO0FBQzVDLGtEQUFrRDtBQUNsRCxnQ0FBZ0M7QUFFaEMsV0FBVztBQUNYLGFBQWE7QUFDYixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ3hDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQU9oRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQVMzQyxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBRWpELHFFQUFxRTtBQUNyRSxrRkFBa0Y7QUFDbEYsTUFBTSxDQUFDLE9BQU8sT0FBTyxZQUFZO0lBQ3JCLFFBQVEsQ0FBcUI7SUFDN0IsYUFBYSxDQUErQjtJQUM1QyxPQUFPLENBQWU7SUFDdEIsUUFBUSxDQUFRO0lBQ2hCLElBQUksQ0FBWTtJQUNoQixRQUFRLENBQWlEO0lBQ3pELFNBQVMsQ0FBMEI7SUFDbkMsYUFBYSxDQUFVO0lBQ3ZCLGNBQWMsQ0FBQTtJQUNkLGFBQWEsQ0FBb0I7SUFDakMsY0FBYyxDQUlyQjtJQUNPLFVBQVUsQ0FBUTtJQUNsQixZQUFZLENBQVE7SUFDcEIsbUJBQW1CLENBQVM7SUFDNUIsWUFBWSxDQUFRO0lBQ3BCLGNBQWMsQ0FBVTtJQUN4QixjQUFjLENBQVU7SUFDeEIsT0FBTyxDQUFVO0lBQ2pCLFNBQVMsQ0FBVTtJQUUzQixZQUNJLGNBQW1DLEVBQ25DLFlBQTJDLEVBQzNDLE1BQXFCO1FBRXJCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUk7WUFDQSxHQUFHLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzlDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDMUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFFdEIsZ0RBQWdEO1lBQ2hELE1BQU0sWUFBWSxHQUFHO2dCQUNqQixxQkFBcUIsRUFBRSxLQUFLO2dCQUM1QixpQkFBaUIsRUFBRSxPQUFPO2dCQUMxQixhQUFhLEVBQUUsS0FBSztnQkFDcEIsY0FBYyxFQUFFLEtBQUs7YUFDeEIsQ0FBQTtZQUVELHNCQUFzQjtZQUN0QixtREFBbUQ7WUFDbkQsa0VBQWtFO1lBQ2xFLDJCQUEyQjtZQUMzQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO2dCQUNwQixtRUFBbUU7Z0JBQ25FLG1DQUFtQztnQkFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFDLEdBQUcsZUFBZSxFQUFFLEdBQUcsWUFBWTtvQkFDaEQsR0FBRyxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7YUFDM0M7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFDLEdBQUcsZUFBZSxFQUFFLEdBQUcsY0FBYztvQkFDbEQsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7YUFDeEI7WUFFRCw0REFBNEQ7WUFDNUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTthQUNuRDtpQkFBTTtnQkFDSCxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO2FBQ3BEO1lBRUQsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFBO1lBQ3hHLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtZQUMvRSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN4QixhQUFhO1lBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDMUUsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7WUFDN0IsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztTQUUxQjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osR0FBRyxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxDQUFDLENBQUM7WUFDL0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQix5REFBeUQ7WUFDekQsTUFBTSxLQUFLLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCw0RUFBNEU7SUFDNUU7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLFlBQW9DO1FBQzVFLElBQUksTUFBTSxHQUFZLElBQUksQ0FBQztRQUMzQiwrQkFBK0I7UUFFL0Isa0RBQWtEO1FBQ2xELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN4QyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUM3QjtTQUNKO1FBRUQsMEVBQTBFO1FBQzFFLDRDQUE0QztRQUM1Qyx1REFBdUQ7UUFDdkQsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUU7WUFDckMsTUFBTSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNyRSxHQUFHLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLGtCQUFrQixDQUFFLENBQUE7WUFDakUsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO2FBQ2hDO1lBQ0QsdURBQXVEO1lBQ3ZELG1DQUFtQztZQUNuQyxJQUFJO1NBQ1A7UUFFRCxnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBRXBCLDBFQUEwRTtRQUMxRSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUM5QixhQUFhO1lBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDM0Q7UUFFRCwrQ0FBK0M7UUFDL0MsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUU7WUFDckMsaURBQWlEO1lBQ2pELEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUE7WUFDdkUsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFFBQVEsRUFBRTtnQkFDaEMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNqQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssUUFBUSxFQUFFO2dCQUN2QyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ2xCO2lCQUFNO2dCQUNILEdBQUcsQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtnQkFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQTthQUN6RDtTQUNKO1FBRUQsMENBQTBDO1FBQzFDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtZQUNaLDJEQUEyRDtZQUUzRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxFQUFFO2dCQUN4QixHQUFHLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7Z0JBQ3pELE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDL0M7aUJBQU07Z0JBQ0gsR0FBRyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3BFLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3JEO1lBRUQsb0NBQW9DO1lBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFBO1lBRTVCLDZCQUE2QjtZQUM3QiwwREFBMEQ7WUFDMUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFBO1lBQ3hGLE9BQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBRWpELGdDQUFnQztnQkFDaEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUVyQixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssYUFBYSxFQUFFO29CQUNuQyx1Q0FBdUM7b0JBQ3ZDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO3dCQUMxQixhQUFhO3dCQUNiLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtxQkFDdEM7b0JBQ0Qsc0NBQXNDO29CQUN0QyxJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtvQkFDN0UsR0FBRyxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsSUFBSSx5QkFBeUIsQ0FBQyxDQUFBO29CQUMvRSxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQTtpQkFDL0I7cUJBRUksSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLGdCQUFnQixFQUFFO29CQUMzQyxzREFBc0Q7b0JBQ3RELE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUE7aUJBQy9CO3FCQUVJLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxlQUFlLEVBQUU7b0JBQzFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDOzJCQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRTt3QkFDaEMsdUNBQXVDO3dCQUN2Qyx1Q0FBdUM7d0JBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUE7cUJBQ2xDO29CQUNELDBCQUEwQjtvQkFDMUIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUE7aUJBQy9CO3FCQUVJLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxjQUFjLEVBQUU7b0JBQ3pDLHNFQUFzRTtvQkFDdEUsNkNBQTZDO29CQUM3QyxPQUFPLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3pEO2FBQ0o7WUFFRCxpQ0FBaUM7WUFDakMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkUsR0FBRyxDQUFDLElBQUksQ0FBQywrQ0FBK0MsSUFBSSxDQUFDLFVBQVUseUJBQXlCLENBQUMsQ0FBQztZQUVsRyxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBRXBCLGtDQUFrQztZQUNsQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0QsYUFBYTtZQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzNEO0lBQ0wsQ0FBQztJQUVELDRFQUE0RTtJQUM1RTs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsY0FBa0MsRUFBRSxNQUFlO1FBQ25FLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsNEVBQTRFO0lBQzVFOzs7OztPQUtHO0lBQ0gsUUFBUSxDQUFDLEtBQWlCLEVBQUUsU0FBaUI7UUFDekMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDekQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLE9BQU8sUUFBUSxDQUFDO2FBQ25CO1NBQ0o7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixTQUFTLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUNwRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsU0FBUyxPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDNUUsR0FBRyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO1FBQzNDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCw0RUFBNEU7SUFDNUU7Ozs7T0FJRztJQUNILGlCQUFpQixDQUFDLFFBQWdCO1FBQzlCLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDaEUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDOUQ7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUNBQXVDLFFBQVEsb0RBQW9ELENBQUMsQ0FBQztRQUMvRyxHQUFHLENBQUMsS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7UUFDdkUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUUsT0FBTyxJQUFJLENBQUEsQ0FBQSxDQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxLQUFpQjtRQUM1QixzQ0FBc0M7UUFDdEMsc0RBQXNEO1FBQ3RELDRDQUE0QztRQUM1QyxJQUFJLFFBQVEsQ0FBQztRQUNiLElBQUksS0FBSyxDQUFDO1FBQ1YsSUFBSSxRQUFRLENBQUM7UUFDYixJQUFJLFdBQVcsQ0FBQztRQUNoQixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtZQUN6RCxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLE9BQU8sUUFBUSxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksT0FBTyxRQUFRLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRTtnQkFDL0UsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZCLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUU1QixrRUFBa0U7Z0JBQ2xFLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtpQkFDdkM7cUJBQU07b0JBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUNyQzthQUNKO2lCQUFNO2dCQUNILEdBQUcsQ0FBQyxLQUFLLENBQUMsb0VBQW9FLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDN0Y7U0FDSjtRQUNELGdFQUFnRTtJQUNwRSxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFOztPQUVHO0lBQ0gsYUFBYTtRQUNULElBQUksT0FBaUIsQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzdDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hELElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sRUFBRTtvQkFDdkIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDdkI7cUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUMvQixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDaEM7cUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDbEM7cUJBQU07b0JBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDdkI7YUFDSjtTQUNKO0lBQ0wsQ0FBQztJQUVELDRFQUE0RTtJQUM1RTs7T0FFRztJQUNILEtBQUssQ0FBQyxhQUFhO1FBQ2YsYUFBYTtRQUNiLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUNuQyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25CLENBQUM7SUFHRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsRUFBVTtRQUNaLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN2RCxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLHdCQUF3QjtJQUN4Qiw0RUFBNEU7SUFDNUU7OztPQUdHO0lBQ0gsV0FBVyxDQUFDLFlBQW9CO1FBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxjQUFjLENBQUMsY0FBa0I7UUFDN0IsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkYsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsWUFBb0IsRUFBRSxLQUFVO1FBQzVDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsaUJBQWlCLENBQUMsWUFBb0I7UUFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN4RixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILG1CQUFtQixDQUFDLE9BQW9CLEVBQUUsTUFBYztRQUNwRCxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3RixDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLCtCQUErQjtJQUMvQiw0RUFBNEU7SUFDNUUscURBQXFEO0lBRXJELGlCQUFpQjtJQUNqQixNQUFNLENBQUMsY0FBa0I7UUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkYsQ0FBQztJQUVELGtCQUFrQjtJQUNsQixnQkFBZ0IsQ0FBQyxZQUFvQixFQUFFLEtBQVU7UUFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdGLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBb0IsRUFBRSxLQUFVO1FBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3RixDQUFDO0lBRUQsb0JBQW9CO0lBQ3BCLElBQUksQ0FBQyxZQUFvQjtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3hGLENBQUM7SUFFRCxzQkFBc0I7SUFDdEIsR0FBRyxDQUFDLE9BQW9CLEVBQUUsTUFBYztRQUNwQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3RixDQUFDO0lBRUwsZ0ZBQWdGO0lBQ2hGLGlCQUFpQjtJQUNqQixnRkFBZ0Y7SUFFNUUsS0FBSyxDQUFDLFVBQWtCO1FBQ3BCLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzFFLENBQUM7SUFFRCxPQUFPLENBQUMsVUFBa0IsRUFBRSxVQUFrQixFQUFFLFNBQWlCLENBQUM7UUFDOUQsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNoRyxDQUFDO0lBRUQsY0FBYyxDQUFDLFVBQWtCLEVBQUUsSUFBYTtRQUM1QyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDekYsQ0FBQztJQUVELGtCQUFrQixDQUFDLFVBQWtCO1FBQ2pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkYsQ0FBQztJQUVELFlBQVksQ0FBQyxVQUFrQjtRQUMzQixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqRixDQUFDO0lBRUQsWUFBWSxDQUFDLFVBQWtCO1FBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2pGLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBa0I7UUFDekIsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDL0UsQ0FBQztJQUVELFdBQVcsQ0FBQyxVQUFrQixFQUFFLFFBQWdCLENBQUM7UUFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3ZGLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBa0I7UUFDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUUsQ0FBQztJQUVELFdBQVcsQ0FBQyxVQUFrQjtRQUMxQixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNoRixDQUFDO0lBRUQsdUJBQXVCLENBQUMsVUFBa0I7UUFDdEMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM1RixDQUFDO0lBRUQsaUJBQWlCLENBQUMsVUFBa0I7UUFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN0RixDQUFDO0lBRUQsYUFBYSxDQUFDLFVBQWtCO1FBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xGLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxVQUFrQjtRQUNoQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RGLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBa0IsRUFBRSxVQUFrQjtRQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDM0YsQ0FBQztJQUVELFlBQVksQ0FBQyxVQUFrQixFQUFFLEtBQWE7UUFDMUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3hGLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBa0IsRUFBRSxPQUFnQjtRQUMzQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDeEYsQ0FBQztJQUVELGFBQWEsQ0FBQyxVQUFrQixFQUFFLFVBQW1CO1FBQ2pELEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RixDQUFDO0lBRUQsaUJBQWlCLENBQUMsVUFBa0IsRUFBRSxRQUFnQixJQUFJO1FBQ3RELEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdGLENBQUM7SUFFTCxnRkFBZ0Y7SUFDaEYsZUFBZTtJQUNmLGdGQUFnRjtJQUU1RSxTQUFTLENBQUMsWUFBb0IsRUFBRSxJQUFRO1FBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN0RixDQUFDO0lBRUQsYUFBYSxDQUFDLFlBQW9CLEVBQUUsSUFBUTtRQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUYsQ0FBQztJQUVELGNBQWMsQ0FBQyxZQUFvQixFQUFFLEdBQVcsRUFBRSxJQUFZO1FBQzFELEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUVELGNBQWMsQ0FBQyxZQUFvQixFQUFFLEtBQWE7UUFDOUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzVGLENBQUM7SUFFRCxlQUFlLENBQUMsWUFBb0IsRUFBRSxTQUFhO1FBQy9DLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqRyxDQUFDO0lBRUQsVUFBVSxDQUFDLFlBQW9CLEVBQUUsR0FBVyxFQUFFLElBQVk7UUFDdEQsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM1RixDQUFDO0lBRUQsVUFBVSxDQUFDLFlBQW9CLEVBQUUsS0FBYTtRQUMxQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDeEYsQ0FBQztJQUVELFdBQVcsQ0FBQyxZQUFvQixFQUFFLFNBQWE7UUFDM0MsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdGLENBQUM7SUFFRCxhQUFhLENBQUMsWUFBb0IsRUFBRSxHQUFXLEVBQUUsSUFBWTtRQUN6RCxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQy9GLENBQUM7SUFFRCxhQUFhLENBQUMsWUFBb0IsRUFBRSxLQUFhO1FBQzdDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMzRixDQUFDO0lBRUQsY0FBYyxDQUFDLFlBQW9CLEVBQUUsU0FBYTtRQUM5QyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUVELFdBQVcsQ0FBQyxZQUFvQixFQUFFLEtBQWM7UUFDNUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3pGLENBQUM7SUFFRCxHQUFHLENBQUMsWUFBb0I7UUFDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUUsQ0FBQztJQUVELGNBQWMsQ0FBQyxZQUFvQjtRQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNyRixDQUFDO0lBRUQsT0FBTyxDQUFDLFlBQW9CO1FBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzlFLENBQUM7SUFFRCxRQUFRLENBQUMsWUFBb0I7UUFDekIsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDL0UsQ0FBQztJQUVELFdBQVcsQ0FBQyxZQUFvQjtRQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsRixDQUFDO0lBRUQsT0FBTyxDQUFDLFlBQW9CLEVBQUUsSUFBWTtRQUN0QyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEYsQ0FBQztJQUVELFFBQVEsQ0FBQyxZQUFvQixFQUFFLEtBQVU7UUFDckMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEcsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RGLENBQUM7SUFFRCw0RUFBNEU7SUFDNUUsUUFBUTtJQUNSLDRFQUE0RTtJQUM1RSw0RUFBNEU7SUFDNUUsS0FBSyxDQUFDLGFBQWEsQ0FBRSxNQUEwQixFQUFFLFlBQTJDO1FBQ3hGLE9BQU87UUFDUCxHQUFHLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLENBQUE7UUFDaEQsR0FBRyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFBO1FBRTNELHVCQUF1QjtRQUN2QixJQUFJLFlBQVksQ0FBQztRQUNqQixJQUFJO1lBQ0EsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUE7WUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDekMsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM3RTtRQUFDLE9BQU8sS0FBVSxFQUFFO1lBQ2pCLElBQUksS0FBSyxLQUFLLGVBQWUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyw4QkFBOEIsQ0FBQTthQUNyRDtpQkFBTSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsa0ZBQWtGLENBQUE7YUFDekc7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFBO2FBQ3BDO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1NBQ3ZDO1FBRUQsMkJBQTJCO1FBQzNCLElBQUksYUFBYSxDQUFDO1FBQ2xCLElBQUksWUFBWSxLQUFLLGdCQUFnQixFQUFDO1lBQ2xDLElBQUk7Z0JBQ0EsYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNoRjtZQUFDLE9BQU8sS0FBVSxFQUFFO2dCQUNqQixJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxZQUFZLEdBQUcsK0VBQStFLENBQUM7aUJBQ3ZHO3FCQUFNLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxvSEFBb0gsQ0FBQztpQkFDNUk7cUJBQU07b0JBQ0gsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFBO2lCQUNwQztnQkFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtnQkFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO2FBQ3ZDO1NBQ0o7SUFDTCxDQUFDO0lBRUQseUZBQXlGO0lBQ3pGLG9EQUFvRDtJQUNwRCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWUsRUFBRSxZQUFxQixFQUFFLE9BQXVEO1FBQ3hHLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQTtRQUNwRCxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssRUFBRSxFQUFFO1lBQzFCLDJEQUEyRDtZQUMzRCxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQTtZQUMxRSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDcEMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEtBQUssRUFBRSxFQUFFO2dCQUNoRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQ3hEO1lBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFBO1lBQy9ELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtZQUNuQyxhQUFhO1lBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2xCO0lBRUwsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxnRUFBZ0U7SUFDaEUsSUFBSTtJQUVKLCtEQUErRDtJQUMvRCxnRUFBZ0U7SUFDaEUsSUFBSTtJQUVKLDBFQUEwRTtJQUMxRSw4REFBOEQ7SUFDOUQsSUFBSTtJQUVKLG1EQUFtRDtJQUNuRCwrREFBK0Q7SUFDL0QsSUFBSTtJQUVKLDZDQUE2QztJQUM3QyxrRUFBa0U7SUFDbEUsSUFBSTtJQUVKLG1FQUFtRTtJQUNuRSxpRUFBaUU7SUFDakUsSUFBSTtJQUVKLHVGQUF1RjtJQUN2Riw4REFBOEQ7SUFDOUQsSUFBSTtJQUVKLHdDQUF3QztJQUN4QywrREFBK0Q7SUFDL0QsSUFBSTtJQUVKLDBCQUEwQjtJQUMxQiwwREFBMEQ7SUFDMUQsSUFBSTtJQUVKLEtBQUssQ0FBQyxZQUFZO1FBQ2QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDekIsR0FBRyxDQUFDLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO1lBQzdFLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtZQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDekIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUE7WUFDN0IsQ0FBQyxDQUFDLENBQUM7WUFDSCxHQUFHLENBQUMsS0FBSyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7U0FDbEY7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMzQixHQUFHLENBQUMsSUFBSSxDQUFDLGlFQUFpRSxDQUFDLENBQUM7WUFDNUUsR0FBRyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBO1lBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUM5QixDQUFDLENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsQ0FBQztTQUNqRjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELGlEQUFpRDtJQUNqRCx1Q0FBdUM7SUFDdkMsNkRBQTZEO0lBQzdELElBQUk7SUFFSiw0RUFBNEU7SUFDNUU7Ozs7T0FJRztJQUNILGFBQWEsQ0FBQyxPQUFPLEdBQUMsS0FBSyxFQUFFLEtBQUssR0FBQyxHQUFHO1FBQ2xDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBRSxLQUFLLElBQUksRUFBRTtnQkFFckMsbURBQW1EO2dCQUNuRCxjQUFjLElBQUksS0FBSyxDQUFDO2dCQUN4Qiw2RUFBNkU7Z0JBRTdFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxXQUFXLEVBQUU7b0JBQzlDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtpQkFDbEM7cUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLGdCQUFnQixFQUFFO29CQUMxRCxHQUFHLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUE7b0JBQ3BELGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtvQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtpQkFDeEM7cUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLGVBQWUsRUFBRTtvQkFDekQsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFBO29CQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO2lCQUN2QztxQkFBTSxJQUFJLGNBQWMsR0FBRyxPQUFPLEVBQUU7b0JBQ2pDLEdBQUcsQ0FBQyxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtvQkFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtvQkFDOUQsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFBO29CQUN6QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7aUJBQ3BCO1lBQ0wsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ2IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFOzs7O09BSUc7SUFDSCxjQUFjLENBQUMsT0FBTyxHQUFDLEtBQUssRUFBRSxLQUFLLEdBQUMsR0FBRztRQUNuQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztZQUN2QixJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBRXJDLG1EQUFtRDtnQkFDbkQsY0FBYyxJQUFJLEtBQUssQ0FBQztnQkFDeEIsNkVBQTZFO2dCQUU3RSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEtBQUssZ0JBQWdCLEVBQUU7b0JBQ25ELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtpQkFDL0I7cUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLFNBQVMsRUFBRTtvQkFDbkQsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO29CQUN0QyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUE7b0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7aUJBQ3hDO3FCQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxRQUFRLEVBQUU7b0JBQ2xELGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtvQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtpQkFDdkM7cUJBQU0sSUFBSSxjQUFjLEdBQUcsT0FBTyxFQUFFO29CQUNqQyxHQUFHLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUE7b0JBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUE7b0JBQ2hFLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtvQkFDekIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO2lCQUNwQjtZQUNMLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNiLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDZCQUE2QjtJQUM3Qiw0RUFBNEU7SUFDNUUsdURBQXVEO0lBQ3ZELHVFQUF1RTtJQUN2RSw0REFBNEQ7SUFDNUQseUdBQXlHO0lBQ3pHLDhFQUE4RTtJQUM5RSxzREFBc0Q7SUFFdEQsNEVBQTRFO0lBQzVFLG9CQUFvQjtJQUNwQiw0RUFBNEU7SUFDNUUsV0FBVztRQUNQLGFBQWE7UUFDYixPQUFPLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVELG9CQUFvQixDQUFDLGVBQTJCO1FBQzVDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtZQUN6RSxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQ1gsU0FBUyxJQUFJLElBQUksQ0FBQTthQUNwQjtZQUNELFNBQVMsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7U0FDdEM7UUFDRCxPQUFPLFNBQVMsQ0FBQTtJQUNwQixDQUFDO0lBRUQscUJBQXFCO1FBQ2pCLDZDQUE2QztRQUM3QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUVqQyx5REFBeUQ7UUFDekQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3JFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxhQUFhLENBQUMsT0FBNEI7UUFDdEMsSUFBSSxHQUFXLENBQUM7UUFFaEIscUNBQXFDO1FBQ3JDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO1lBQ2hFLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2hDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxVQUFVLEVBQUU7b0JBQ3ZELEdBQUcsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEdBQUcsa0VBQWtFLENBQUMsQ0FBQTtvQkFDMUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsa0VBQWtFLENBQUMsQ0FBQTtvQkFDbEgsTUFBTSxJQUFJLGtCQUFrQixDQUFDLDBCQUEwQixHQUFHLGtFQUFrRSxDQUFDLENBQUE7aUJBQ2hJO2FBQ0o7U0FDSjtRQUVELDJCQUEyQjtRQUMzQixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtZQUNoRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNoQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3BELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDeEIsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUMxQyxHQUFHLENBQUMsS0FBSyxDQUFDLDBCQUEwQixHQUFHLGlFQUFpRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO29CQUNoSCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxpRUFBaUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtvQkFDeEgsTUFBTSxJQUFJLGtCQUFrQixDQUFDLDBCQUEwQixHQUFHLGlFQUFpRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO2lCQUN0STtxQkFDSSxJQUFJLEdBQUcsS0FBSyxlQUFlLElBQUksR0FBRyxLQUFLLG9CQUFvQixFQUFFO29CQUM5RCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDakQsR0FBRyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxrQ0FBa0MsS0FBSyxFQUFFLENBQUMsQ0FBQTt3QkFDakYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsa0NBQWtDLEtBQUssRUFBRSxDQUFDLENBQUE7d0JBQ3pGLE1BQU0sSUFBSSxrQkFBa0IsQ0FBQywwQkFBMEIsR0FBRyxrQ0FBa0MsS0FBSyxFQUFFLENBQUMsQ0FBQTtxQkFDdkc7aUJBQ0o7cUJBQ0ksSUFBSSxHQUFHLEtBQUssZ0JBQWdCLEVBQUU7b0JBQy9CLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUc7d0JBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEdBQUcsZ0NBQWdDLEtBQUssRUFBRSxDQUFDLENBQUE7d0JBQy9FLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLGdDQUFnQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO3dCQUN2RixNQUFNLElBQUksa0JBQWtCLENBQUMsMEJBQTBCLEdBQUcsZ0NBQWdDLEtBQUssRUFBRSxDQUFDLENBQUE7cUJBQ3JHO2lCQUNKO2FBQ0o7U0FDSjtRQUVELDBCQUEwQjtRQUMxQixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDdkQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzNCLDJDQUEyQztZQUMzQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQzVCLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0ZBQWtGLEtBQUssRUFBRSxDQUFDLENBQUE7b0JBQ3BHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtGQUFrRixLQUFLLEVBQUUsQ0FBQyxDQUFBO29CQUM1RyxNQUFNLElBQUksa0JBQWtCLENBQUMsa0ZBQWtGLEtBQUssRUFBRSxDQUFDLENBQUE7aUJBQzFIO2dCQUNELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQzlCLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUU7b0JBQ3BELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtvQkFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7d0JBQ3pFLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0ZBQWtGLEtBQUssRUFBRSxDQUFDLENBQUE7d0JBQ3BHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtGQUFrRixLQUFLLEVBQUUsQ0FBQyxDQUFBO3dCQUM1RyxNQUFNLElBQUksa0JBQWtCLENBQUMsa0ZBQWtGLEtBQUssRUFBRSxDQUFDLENBQUE7cUJBQzFIO2lCQUNKO2FBQ0o7U0FDSjtJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILDZCQUE2QixDQUFDLE9BQTRCO1FBQ3RELElBQUksR0FBVyxDQUFDO1FBQ2hCLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO1lBQ2hFLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2hDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7YUFDbEQ7U0FDSjtRQUNELE9BQU8sT0FBTyxDQUFBO0lBQ2xCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGFBQWEsQ0FBQyxLQUFtQyxFQUFHLFFBQWlCLEtBQUs7UUFDdEUsSUFBSSxPQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssUUFBUSxFQUFDO1lBQzNCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDdEM7YUFBTSxJQUFJLE9BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxXQUFXLEVBQUM7WUFDckMsT0FBTyxLQUFLLENBQUE7U0FDZjtRQUNELFFBQU8sS0FBSyxFQUFDO1lBQ1QsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLEtBQUs7Z0JBQ04sT0FBTyxJQUFJLENBQUM7WUFDaEIsS0FBSyxLQUFLLENBQUM7WUFDWCxLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxLQUFLLENBQUM7WUFDWCxLQUFLLElBQUk7Z0JBQ0wsT0FBTyxLQUFLLENBQUE7WUFDaEI7Z0JBQ0ksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3pDO0lBQ0wsQ0FBQztDQUNKO0FBRUQsZ0ZBQWdGO0FBQ2hGLGNBQWM7QUFDZCxnRkFBZ0YifQ==