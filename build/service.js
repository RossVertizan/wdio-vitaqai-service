//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
// import stringify = Mocha.utils.stringify;
const logger = require('@wdio/logger').default;
const log = logger('wdio-vitaqai-service');
const path = require("path");
// Packages
// @ts-ignore
import { VitaqAiApi } from 'vitaqai-api';
import { SevereServiceError } from 'webdriverio';
const { DEFAULT_OPTIONS } = require("./defaults");
// TODO: Following line used for running tests - need to resolve this
// exports.VitaqService = class VitaqService implements Services.ServiceInstance {
module.exports = class VitaqService {
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
};
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGO0FBRWhGLDRDQUE0QztBQUU1QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3QixXQUFXO0FBQ1gsYUFBYTtBQUNiLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDeEMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sYUFBYSxDQUFBO0FBYWhELE1BQU0sRUFBRSxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7QUFFakQscUVBQXFFO0FBQ3JFLGtGQUFrRjtBQUNsRixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sWUFBWTtJQUN2QixRQUFRLENBQXFCO0lBQzdCLGFBQWEsQ0FBK0I7SUFDNUMsT0FBTyxDQUFlO0lBQ3RCLFFBQVEsQ0FBUTtJQUNoQixJQUFJLENBQVk7SUFDaEIsUUFBUSxDQUFpRDtJQUN6RCxTQUFTLENBQTBCO0lBQ25DLGFBQWEsQ0FBVTtJQUN2QixjQUFjLENBQUE7SUFDZCxhQUFhLENBQW9CO0lBQ2pDLGNBQWMsQ0FJckI7SUFDTyxVQUFVLENBQVE7SUFDbEIsWUFBWSxDQUFRO0lBQ3BCLG1CQUFtQixDQUFTO0lBQzVCLFlBQVksQ0FBUTtJQUNwQixjQUFjLENBQVU7SUFDeEIsY0FBYyxDQUFVO0lBQ3hCLE9BQU8sQ0FBVTtJQUNqQixTQUFTLENBQVU7SUFFM0IsWUFDSSxjQUFtQyxFQUNuQyxZQUEyQyxFQUMzQyxNQUFxQjtRQUVyQixJQUFJLENBQUMsT0FBTyxH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