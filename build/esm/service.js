/* eslint-disable @typescript-eslint/no-inferrable-types */
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
import * as vitaqSyncFunctions from "./functionsSync.js";
import * as vitaqAsyncFunctions from "./functionsAsync.js";
const log = logger('wdio-vitaqai-service');
import { DEFAULT_OPTIONS } from "./defaults.js";
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
            if (log) {
                log.debug("serviceOptions: ", serviceOptions);
                log.debug("capabilities: ", capabilities);
                log.debug("config: ", config);
            }
            this._capabilities = capabilities ?? {};
            this._config = config ?? {};
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
            // Use either the Sync or Async versions of the functions
            if (this._options.useSync) {
                this.vitaqFunctions = vitaqSyncFunctions;
            }
            else {
                this.vitaqFunctions = vitaqAsyncFunctions;
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
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        let result = true;
        // let returnSuite: MochaSuite;
        try {
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
                        const seed = await this.vitaqFunctions.getSeed('top', this._browser, this._api);
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
        catch (error) {
            log.error("nextActionSelector: Error: ", error);
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
        try {
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
        catch (error) {
            log.error("getSuite: Error: ", error);
            return null;
        }
    }
    // -------------------------------------------------------------------------
    /**
     *
     * @param fileName - Name of the file which contains the suites to run
     * @returns {suites/null}
     */
    getSuitesFromFile(fileName) {
        try {
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
        catch (error) {
            log.error("getSuitesFromFile: Error: ", error);
            return null;
        }
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
        try {
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
        catch (error) {
            log.error("createSuiteMap: Error: ", error);
        }
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
        // eslint-disable-next-line prefer-rest-params
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
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.requestData(variableName, this._browser, this._api);
    }
    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api);
    }
    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api);
    }
    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName) {
        // eslint-disable-next-line prefer-rest-params
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
    // eslint-disable-next-line @typescript-eslint/ban-types
    createVitaqLogEntry(message, format = 'text') {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api);
    }
    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHOD ALIASES
    // -------------------------------------------------------------------------
    // Easier names to use with the Vitaq control methods
    // recordCoverage
    record(variablesArray) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api);
    }
    // sendDataToVitaq
    writeDataToVitaq(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api);
    }
    write(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api);
    }
    // readDataFromVitaq
    read(variableName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.readDataFromVitaq(variableName, this._browser, this._api);
    }
    // createVitaqLogEntry
    // eslint-disable-next-line @typescript-eslint/ban-types
    log(message, format = 'text') {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api);
    }
    // =============================================================================
    // Action Methods
    // =============================================================================
    abort(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.abort(actionName, this._browser, this._api);
    }
    addNext(actionName, nextAction, weight = 1) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.addNext(actionName, nextAction, weight, this._browser, this._api);
    }
    clearCallCount(actionName, tree) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.clearCallCount(actionName, tree, this._browser, this._api);
    }
    displayNextActions(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.displayNextActions(actionName, this._browser, this._api);
    }
    getCallCount(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getCallCount(actionName, this._browser, this._api);
    }
    getCallLimit(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getCallLimit(actionName, this._browser, this._api);
    }
    getEnabled(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getEnabled(actionName, this._browser, this._api);
    }
    getPrevious(actionName, steps) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getPrevious(actionName, steps, this._browser, this._api);
    }
    getId(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getId(actionName, this._browser, this._api);
    }
    nextActions(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.nextActions(actionName, this._browser, this._api);
    }
    numberActiveNextActions(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.numberActiveNextActions(actionName, this._browser, this._api);
    }
    numberNextActions(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.numberNextActions(actionName, this._browser, this._api);
    }
    removeAllNext(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.removeAllNext(actionName, this._browser, this._api);
    }
    removeFromCallers(actionName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.removeFromCallers(actionName, this._browser, this._api);
    }
    removeNext(actionName, nextAction) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.removeNext(actionName, nextAction, this._browser, this._api);
    }
    setCallLimit(actionName, limit) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setCallLimit(actionName, limit, this._browser, this._api);
    }
    setEnabled(actionName, enabled) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setEnabled(actionName, enabled, this._browser, this._api);
    }
    setExhaustive(actionName, exhaustive) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setExhaustive(actionName, exhaustive, this._browser, this._api);
    }
    setMaxActionDepth(actionName, depth = 1000) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setMaxActionDepth(actionName, depth, this._browser, this._api);
    }
    // =============================================================================
    // Data Methods
    // =============================================================================
    allowList(variableName, list) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowList(variableName, list, this._browser, this._api);
    }
    allowOnlyList(variableName, list) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyList(variableName, list, this._browser, this._api);
    }
    allowOnlyRange(variableName, low, high) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyRange(variableName, low, high, this._browser, this._api);
    }
    allowOnlyValue(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyValue(variableName, value, this._browser, this._api);
    }
    allowOnlyValues(variableName, valueList) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowOnlyValues(variableName, valueList, this._browser, this._api);
    }
    allowRange(variableName, low, high) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowRange(variableName, low, high, this._browser, this._api);
    }
    allowValue(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowValue(variableName, value, this._browser, this._api);
    }
    allowValues(variableName, valueList) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.allowValues(variableName, valueList, this._browser, this._api);
    }
    disallowRange(variableName, low, high) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.disallowRange(variableName, low, high, this._browser, this._api);
    }
    disallowValue(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.disallowValue(variableName, value, this._browser, this._api);
    }
    disallowValues(variableName, valueList) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.disallowValues(variableName, valueList, this._browser, this._api);
    }
    doNotRepeat(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.doNotRepeat(variableName, value, this._browser, this._api);
    }
    gen(variableName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.gen(variableName, this._browser, this._api);
    }
    getDoNotRepeat(variableName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getDoNotRepeat(variableName, this._browser, this._api);
    }
    getSeed(variableName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getSeed(variableName, this._browser, this._api);
    }
    getValue(variableName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.getValue(variableName, this._browser, this._api);
    }
    resetRanges(variableName) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.resetRanges(variableName, this._browser, this._api);
    }
    setSeed(variableName, seed) {
        // eslint-disable-next-line prefer-rest-params
        log.info(`Calling "${this.getFuncName()}" with arguments "${this.createArgumentString(arguments)}"`);
        return this.vitaqFunctions.setSeed(variableName, seed, this._browser, this._api);
    }
    setValue(variableName, value) {
        // eslint-disable-next-line prefer-rest-params
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
            if (typeof this._browser !== "undefined") {
                await this._browser.deleteSession();
            }
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
            const intervalId = setInterval(async () => {
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
            const intervalId = setInterval(async () => {
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
                const value = options[key];
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
            const value = options['seed'];
            // Check that we only have 0-9, "," and "-"
            if (typeof value === 'string') {
                if (!value.match(/^[0-9,-]*$/)) {
                    log.error(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${value}`);
                    this._errors.push(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${value}`);
                    throw new SevereServiceError(`The value provided for "seed" must be of the form "1-9,10,11,12,13,14-25", got ${value}`);
                }
                const entries = value.split(",");
                for (let index = 0; index < entries.length; index += 1) {
                    const entry = entries[index].trim();
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
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
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
