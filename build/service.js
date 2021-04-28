"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service');
// Packages
// @ts-ignore
const vitaqai_api_1 = __importDefault(require("vitaqai_api"));
const constants_1 = require("./constants");
module.exports = class VitaqService {
    constructor(serviceOptions, capabilities, config) {
        log.debug("serviceOptions: ", serviceOptions);
        log.debug("capabilities: ", capabilities);
        log.debug("config: ", config);
        this._options = { ...constants_1.DEFAULT_OPTIONS, ...serviceOptions };
        // Import either the Sync or Async versions of the functions
        if (this._options.useSync) {
            // @ts-ignore
            this.vitaqFunctions = require('./functionsSync');
        }
        else {
            // @ts-ignore
            this.vitaqFunctions = require('./functionsAsync');
        }
        this._capabilities = capabilities;
        this._config = config;
        this._api = new vitaqai_api_1.default(this._options);
        this._api.startPython();
        // @ts-ignore
        global.vitaq = this;
        this._counter = 0;
    }
    async nextActionSelector(suite, currentSuite) {
        let nextAction;
        let result = true;
        let returnSuite;
        if (typeof this._options.verbosityLevel !== 'undefined'
            && this._options.verbosityLevel > 50) {
            log.info("VitaqService: nextActionSelector: suite: ", suite);
        }
        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            // @ts-ignore
            if (typeof this._options.verbosityLevel !== 'undefined'
                && this._options.verbosityLevel > 50) {
                log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite);
                log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
            }
            // Map the passed/failed result to true and false
            if (currentSuite.ctx._runnable.state === "passed") {
                result = true;
            }
            else if (currentSuite.ctx._runnable.state === "failed") {
                result = false;
            }
            else {
                // Didn't get either passed or failed
                log.error('VitaqService: nextActionSelector: Unexpected value for state: ', currentSuite.ctx._runnable.state);
                result;
            }
        }
        // Send the result and get the next action
        if (suite.root) {
            log.info("VitaqService: nextActionSelector: This is the root suite");
            if (typeof currentSuite === "undefined") {
                log.info("VitaqService: nextActionSelector: currentSuite is undefined");
                // @ts-ignore
                // nextAction = global.browser.call(() =>
                //     this._api.getNextTestActionCaller(undefined, true));
                nextAction = await this._api.getNextTestActionCaller(undefined, result);
            }
            else {
                // @ts-ignore
                // i.getNextTestActionCaller(currentSuite.title, true));
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite.title);
                nextAction = await this._api.getNextTestActionCaller(currentSuite.title, result);
            }
            log.info("VitaqService: nextActionSelector: Returning nextAction: ", nextAction);
            // Need to return the suite object
            return this.getSuite(suite, nextAction);
        }
    }
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
        console.error("Error: Was unable to find a test action script for: ", suiteName);
        console.warn(`Make sure you have a test file with ${suiteName} as the text in the describe block`);
        console.warn(`This will cause the test to end`);
        return null;
    }
    /**
     * Create an async sleep statement to test the sync capabilities in our test files
     * @param duration
     * @returns {null|*}
     */
    sleep(ms) {
        log.info("VitaqService: sleep: Sleeping for %s seconds", ms / 1000);
        // @ts-ignore
        return global.browser.call(() => new Promise(resolve => setTimeout(resolve, ms)));
    }
    // // -------------------------------------------------------------------------
    // // VITAQ CONTROL METHODS
    // // -------------------------------------------------------------------------
    // /**
    //  * Get Vitaq to generate a new value for the variable and then get it
    //  * @param variableName - name of the variable
    //  */
    // requestData(variableName: string) {
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.requestDataCaller(variableName)
    //     )
    // }
    //
    // /**
    //  * Get Vitaq to record coverage for the variables in the array
    //  * @param variablesArray - array of variables to record coverage for
    //  */
    // recordCoverage(variablesArray: []) {
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.recordCoverageCaller(variablesArray)
    //     )
    // }
    //
    // /**
    //  * Send data to Vitaq and record it on the named variable
    //  * @param variableName - name of the variable
    //  * @param value - value to store
    //  */
    // sendDataToVitaq(variableName: string, value: any) {
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.sendDataToVitaqCaller(variableName, value)
    //     )
    // }
    //
    // /**
    //  * Read data from a variable in Vitaq
    //  * @param variableName - name of the variable to read
    //  */
    // readDataFromVitaq(variableName: string) {
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.readDataFromVitaqCaller(variableName)
    //     )
    // }
    //
    // /**
    //  * Create an entry in the Vitaq log
    //  * @param message - message/data to put into the log
    //  * @param format - format of the message/data, can be "text" (default) or "json"
    //  *
    //  * When using the JSON option the JSON data needs to be stringified using the
    //  * JSON.stringify() method
    //  */
    // createVitaqLogEntry(message: string | {}, format: string) {
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.createVitaqLogEntryCaller(message, format)
    //     )
    // }
    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHODS
    // -------------------------------------------------------------------------
    /**
     * Get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    requestData(variableName) {
        // @ts-ignore
        return this.vitaqFunctions.requestDataCaller(variableName, this._browser, this._api);
    }
    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray) {
        // @ts-ignore
        return this.vitaqFunctions.recordCoverageCaller(variablesArray, this._browser, this._api);
    }
    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName, value) {
        // @ts-ignore
        return this.vitaqFunctions.sendDataToVitaqCaller(variableName, value, this._browser, this._api);
    }
    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName) {
        // @ts-ignore
        return this.vitaqFunctions.readDataFromVitaqCaller(variableName, this._browser, this._api);
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
        // @ts-ignore
        return this.vitaqFunctions.createVitaqLogEntryCaller(message, format, this._browser, this._api);
    }
    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHOD ALIASES
    // -------------------------------------------------------------------------
    // Easier names to use with the Vitaq control methods
    // recordCoverage
    record(variablesArray) {
        return this.recordCoverage(variablesArray);
    }
    // sendDataToVitaq
    writeDataToVitaq(variableName, value) {
        return this.sendDataToVitaq(variableName, value);
    }
    write(variableName, value) {
        return this.sendDataToVitaq(variableName, value);
    }
    // readDataFromVitaq
    read(variableName) {
        return this.readDataFromVitaq(variableName);
    }
    // createVitaqLogEntry
    log(message, format) {
        return this.createVitaqLogEntry(message, format);
    }
    // =============================================================================
    // Action Methods
    // =============================================================================
    abort() {
        // @ts-ignore
        return this.vitaqFunctions.abort(this._browser, this._api);
    }
    addNext(actionName, nextAction, weight = 1) {
        // @ts-ignore
        return this.vitaqFunctions.addNext(actionName, nextAction, weight, this._browser, this._api);
    }
    clearCallCount(actionName, tree) {
        // @ts-ignore
        return this.vitaqFunctions.clearCallCount(actionName, tree, this._browser, this._api);
    }
    displayNextActions(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.displayNextActions(actionName, this._browser, this._api);
    }
    getCallCount(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.getCallCount(actionName, this._browser, this._api);
    }
    getCallLimit(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.getCallLimit(actionName, this._browser, this._api);
    }
    getEnabled(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.getEnabled(actionName, this._browser, this._api);
    }
    getId(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.getId(actionName, this._browser, this._api);
    }
    nextActions(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.nextActions(actionName, this._browser, this._api);
    }
    numberActiveNextActions(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.numberActiveNextActions(actionName, this._browser, this._api);
    }
    numberNextActions(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.numberNextActions(actionName, this._browser, this._api);
    }
    removeAllNext(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.removeAllNext(actionName, this._browser, this._api);
    }
    removeFromCallers(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.removeFromCallers(actionName, this._browser, this._api);
    }
    removeNext(actionName, nextAction) {
        // @ts-ignore
        return this.vitaqFunctions.removeNext(actionName, nextAction, this._browser, this._api);
    }
    setCallLimit(actionName, limit) {
        // @ts-ignore
        return this.vitaqFunctions.setCallLimit(actionName, limit, this._browser, this._api);
    }
    setEnabled(actionName, enabled) {
        // @ts-ignore
        return this.vitaqFunctions.setEnabled(actionName, enabled, this._browser, this._api);
    }
    setExhaustive(actionName, exhaustive) {
        // @ts-ignore
        return this.vitaqFunctions.setExhaustive(actionName, exhaustive, this._browser, this._api);
    }
    setMaxActionDepth(actionName, depth = 1000) {
        // @ts-ignore
        return this.vitaqFunctions.setMaxActionDepth(actionName, depth, this._browser, this._api);
    }
    // =============================================================================
    // Data Methods
    // =============================================================================
    allowList(variableName, list) {
        // @ts-ignore
        return this.vitaqFunctions.allowList(variableName, list, this._browser, this._api);
    }
    allowOnlyList(variableName, list) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyList(variableName, list, this._browser, this._api);
    }
    allowOnlyRange(variableName, low, high) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyRange(variableName, low, high, this._browser, this._api);
    }
    allowOnlyValue(variableName, value) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyValue(variableName, value, this._browser, this._api);
    }
    allowOnlyValues(variableName, valueList) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyValues(variableName, valueList, this._browser, this._api);
    }
    allowRange(variableName, low, high) {
        // @ts-ignore
        return this.vitaqFunctions.allowRange(variableName, low, high, this._browser, this._api);
    }
    allowValue(variableName, value) {
        // @ts-ignore
        return this.vitaqFunctions.allowValue(variableName, value, this._browser, this._api);
    }
    allowValues(variableName, valueList) {
        // @ts-ignore
        return this.vitaqFunctions.allowValues(variableName, valueList, this._browser, this._api);
    }
    disallowRange(variableName, low, high) {
        // @ts-ignore
        return this.vitaqFunctions.disallowRange(variableName, low, high, this._browser, this._api);
    }
    disallowValue(variableName, value) {
        // @ts-ignore
        return this.vitaqFunctions.disallowValue(variableName, value, this._browser, this._api);
    }
    disallowValues(variableName, valueList) {
        // @ts-ignore
        return this.vitaqFunctions.disallowValues(variableName, valueList, this._browser, this._api);
    }
    doNotRepeat(variableName, value) {
        // @ts-ignore
        return this.vitaqFunctions.doNotRepeat(variableName, value, this._browser, this._api);
    }
    gen(variableName) {
        // @ts-ignore
        return this.vitaqFunctions.gen(variableName, this._browser, this._api);
    }
    getDoNotRepeat(variableName) {
        // @ts-ignore
        return this.vitaqFunctions.getDoNotRepeat(variableName, this._browser, this._api);
    }
    getSeed(variableName) {
        // @ts-ignore
        return this.vitaqFunctions.getSeed(variableName, this._browser, this._api);
    }
    getValue(variableName) {
        // @ts-ignore
        return this.vitaqFunctions.getValue(variableName, this._browser, this._api);
    }
    resetRanges(variableName) {
        // @ts-ignore
        return this.vitaqFunctions.resetRanges(variableName, this._browser, this._api);
    }
    setSeed(variableName, seed) {
        // @ts-ignore
        return this.vitaqFunctions.setSeed(variableName, seed, this._browser, this._api);
    }
    setValue(variableName, value) {
        // @ts-ignore
        return this.vitaqFunctions.setValue(variableName, value, this._browser, this._api);
    }
    // // -------------------------------------------------------------------------
    // // STANDARD VITAQ METHODS
    // // -------------------------------------------------------------------------
    // /**
    //  * Abort the action causing it to not select a next action
    //  */
    // abort() {
    //     log.debug('VitaqService: abort: ');
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('abort', {'0': 'currentAction'})
    //     )
    // }
    //
    // /**
    //  * Add an action that can be called after this one
    //  * @param actionName - name of the action
    //  * @param nextAction - name of the action that could be called next
    //  * @param weight - Weight for the selection of the next action
    //  */
    // addNext(actionName: string, nextAction: string, weight: number = 1) {
    //     log.debug('VitaqService: addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('add_next', arguments)
    //     )
    // }
    //
    // /**
    //  * Specify a list to add to the existing list in a list variable
    //  * @param variableName - name of the variable
    //  * @param list - The list to add to the existing list
    //  */
    // allowList(variableName: string, list: []) {
    //     log.debug('VitaqService: allowList: variableName, list', variableName, list);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_list', arguments)
    //     )
    // }
    //
    // /**
    //  * Specify the ONLY list to select from in a list variable
    //  * @param variableName - name of the variable
    //  * @param list - The list to be used for selecting from
    //  */
    // allowOnlyList(variableName: string, list: []) {
    //     log.debug('VitaqService: allowOnlyList: variableName, list', variableName, list);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_only_list', arguments)
    //     )
    // }
    //
    // /**
    //  * Allow ONLY the defined range to be the allowable range for the integer variable
    //  * @param variableName - name of the variable
    //  * @param low - Lower limit of the range
    //  * @param high - Upper limit of the range
    //  */
    // allowOnlyRange(variableName: string, low: number, high: number) {
    //     log.debug('VitaqService: allowOnlyRange: variableName, low, high', variableName, low, high);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_only_range', arguments)
    //     )
    // }
    //
    // /**
    //  * Allow ONLY the defined value to be the allowable value for the integer variable
    //  * @param variableName - name of the variable
    //  * @param value - The value to be allowed
    //  */
    // allowOnlyValue(variableName: string, value: number) {
    //     log.debug('VitaqService: allowOnlyValue: variableName, value', variableName, value);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_only_value', arguments)
    //     )
    // }
    //
    // /**
    //  * Allow ONLY the passed list of values as the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param valueList - list of values that should be allowed
    //  */
    // allowOnlyValues(variableName: string, valueList: []) {
    //     log.debug('VitaqService: allowOnlyValues: variableName, valueList', variableName, valueList);
    //     // @ts-ignore
    //     let vtqArguments = {'0': variableName, '1': valueList.length}
    //     for (let index = 0; index < valueList.length; index += 1) {
    //         let key = index + 2
    //         // @ts-ignore
    //         vtqArguments[key.toString()] = valueList[index]
    //     }
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_only_values', vtqArguments)
    //     )
    // }
    //
    // /**
    //  * Add the defined range to the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param low - Lower limit of the range
    //  * @param high - Upper limit of the range
    //  */
    // allowRange(variableName: string, low: number, high: number) {
    //     log.debug('VitaqService: allowRange: variableName, low, high', variableName, low, high);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_range', arguments)
    //     )
    // }
    //
    // /**
    //  * Add the defined value to the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param value - The value to be allowed
    //  */
    // allowValue(variableName: string, value: number) {
    //     log.debug('VitaqService: allowValue: variableName, value', variableName, value);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_value', arguments)
    //     )
    // }
    //
    // /**
    //  * Add the passed list of values to the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param valueList - list of values that should be allowed
    //  */
    // allowValues(variableName: string, valueList: []) {
    //     log.debug('VitaqService: allowValues: variableName, valueList', variableName, valueList);
    //     // @ts-ignore
    //     let vtqArguments = {'0': variableName, '1': valueList.length}
    //     for (let index = 0; index < valueList.length; index += 1) {
    //         let key = index + 2
    //         // @ts-ignore
    //         vtqArguments[key.toString()] = valueList[index]
    //     }
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_values', vtqArguments)
    //     )
    // }
    //
    // /**
    //  * Set the call_count back to zero
    //  * @param actionName - name of the action
    //  * @param tree - clear call counts on all next actions
    //  */
    // clearCallCount(actionName: string, tree: boolean) {
    //     log.debug('VitaqService: clearCallCount: actionName, tree', actionName, tree);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('clear_call_count', arguments)
    //     )
    // }
    //
    // /**
    //  * Remove the defined range from the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param low - Lower limit of the range
    //  * @param high - Upper limit of the range
    //  */
    // disallowRange(variableName: string, low: number, high: number) {
    //     log.debug('VitaqService: disallowRange: variableName, low, high', variableName, low, high);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('disallow_range', arguments)
    //     )
    // }
    //
    // /**
    //  * Remove the defined value from the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param value - The value to be removed
    //  */
    // disallowValue(variableName: string, value: number) {
    //     log.debug('VitaqService: disallowValue: variableName, value', variableName, value);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('disallow_value', arguments)
    //     )
    // }
    //
    // /**
    //  * Remove the passed list of values from the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param valueList - list of values that should be removed
    //  */
    // disallowValues(variableName: string, valueList: []) {
    //     log.debug('VitaqService: disallowValues: variableName, valueList', variableName, valueList);
    //     // @ts-ignore
    //     let vtqArguments = {'0': variableName, '1': valueList.length}
    //     for (let index = 0; index < valueList.length; index += 1) {
    //         let key = index + 2
    //         // @ts-ignore
    //         vtqArguments[key.toString()] = valueList[index]
    //     }
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('disallow_values', vtqArguments)
    //     )
    // }
    //
    // /**
    //  * Get a string listing all of the possible next actions
    //  * @param actionName - name of the action
    //  */
    // displayNextActions(actionName: string) {
    //     log.debug('VitaqService: displayNextActions: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('display_next_sequences', arguments)
    //     )
    // }
    //
    // /**
    //  * Specify that values should not be repeated
    //  * @param variableName - name of the variable
    //  * @param value - true prevents values from being repeated
    //  */
    // doNotRepeat(variableName: string, value: boolean) {
    //     log.debug('VitaqService: doNotRepeat: variableName, value', variableName, value);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('do_not_repeat', arguments)
    //     )
    // }
    //
    // /**
    //  * get Vitaq to generate a new value for the variable
    //  * @param variableName - name of the variable
    //  */
    // gen(variableName: string) {
    //     log.debug('VitaqService: gen: variableName', variableName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('gen', arguments)
    //     )
    // }
    //
    // /**
    //  * get Vitaq to generate a new value for the variable and then get it
    //  * @param variableName - name of the variable
    //  */
    // getGen(variableName: string) {
    //     log.debug('VitaqService: getGen: variableName', variableName);
    //     // @ts-ignore
    //     this._browser.call(() =>
    //         this._api.runCommandCaller('gen', arguments)
    //     )
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('get_value', arguments)
    //     )
    // }
    //
    // /**
    //  * Get the current call count for this action
    //  * @param actionName - name of the action
    //  */
    // getCallCount(actionName: string) {
    //     log.debug('VitaqService: getCallCount: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('get_call_count', arguments)
    //     )
    // }
    //
    // /**
    //  * Get the maximum number of times this action can be called
    //  * @param actionName - name of the action
    //  */
    // getCallLimit(actionName: string) {
    //     log.debug('VitaqService: getCallLimit: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('get_call_limit', arguments)
    //     )
    // }
    //
    // /**
    //  * Get the current status of do not repeat
    //  * @param variableName - name of the variable
    //  */
    // getDoNotRepeat(variableName: string) {
    //     log.debug('VitaqService: getDoNotRepeat: variableName', variableName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('get_do_not_repeat', arguments)
    //     )
    // }
    //
    //
    // // getEnabled(actionName: string) {
    // //     // @ts-ignore
    // //     return this.vitaqFunctions.getEnabled(actionName, this._browser, this._api)
    // // }
    //
    // // /**
    // //  * Query if the action is enabled
    // //  * @param actionName - name of the action
    // //  */
    // // getEnabled(actionName: string) {
    // //     log.debug('VitaqService: getEnabled: actionName', actionName);
    // //     let argumentsDescription = {"actionName": "string"}
    // //     validateArguments("getEnabled", argumentsDescription, arguments);
    // //     // @ts-ignore
    // //     return this._browser.call(() =>
    // //         this._api.runCommandCaller('get_enabled', arguments)
    // //     )
    // // }
    //
    // /**
    //  * Get a unique ID for this action
    //  * @param actionName - name of the action
    //  */
    // getId(actionName: string) {
    //     log.debug('VitaqService: getId: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('get_id', arguments)
    //     )
    // }
    //
    // /**
    //  * Get the starting seed being used
    //  * @param variableName - name of the variable
    //  */
    // getSeed(variableName: string) {
    //     log.debug('VitaqService: getSeed: variableName', variableName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('get_seed', arguments)
    //     )
    // }
    //
    // /**
    //  * Get the current value of the variable
    //  * @param variableName - name of the variable
    //  */
    // getValue(variableName: string) {
    //     log.debug('VitaqService: getValue: variableName', variableName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('get_value', arguments)
    //     )
    // }
    //
    // /**
    //  * Get all of the possible next actions
    //  * @param actionName - name of the action
    //  */
    // nextActions(actionName: string) {
    //     log.debug('VitaqService: nextActions: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('next_sequences', arguments)
    //     )
    // }
    //
    // /**
    //  * Return the number of active next actions
    //  * @param actionName - name of the action
    //  */
    // numberActiveNextActions(actionName: string) {
    //     log.debug('VitaqService: numberActiveNextActions: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('number_active_next_sequences', arguments)
    //     )
    // }
    //
    // /**
    //  * Return the number of possible next actions
    //  * @param actionName - name of the action
    //  */
    // numberNextActions(actionName: string) {
    //     log.debug('VitaqService: numberNextActions: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('number_next_sequences', arguments)
    //     )
    // }
    //
    // /**
    //  * Remova all actions in the next action list
    //  * @param actionName - name of the action
    //  */
    // removeAllNext(actionName: string) {
    //     log.debug('VitaqService: removeAllNext: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('remove_all_next', arguments)
    //     )
    // }
    //
    // /**
    //  * Remove this action from all callers lists
    //  * @param actionName - name of the action
    //  */
    // removeFromCallers(actionName: string) {
    //     log.debug('VitaqService: removeFromCallers: actionName', actionName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('remove_from_callers', arguments)
    //     )
    // }
    //
    // /**
    //  * Remove an existing next action from the list of next actions
    //  * @param actionName - name of the action
    //  * @param nextAction - name of the action to remove
    //  */
    // removeNext(actionName: string, nextAction: string) {
    //     log.debug('VitaqService: removeNext: actionName, nextAction', actionName, nextAction);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('remove_next', arguments)
    //     )
    // }
    //
    // /**
    //  * Remove all constraints on values
    //  * @param variableName - name of the variable
    //  */
    // resetRanges(variableName: string) {
    //     log.debug('VitaqService: resetRanges: variableName', variableName);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('reset_ranges', arguments)
    //     )
    // }
    //
    // /**
    //  * Set the maximum number of calls for this action
    //  * @param actionName - name of the action
    //  * @param limit - the call limit to set
    //  */
    // setCallLimit(actionName: string, limit: number) {
    //     log.debug('VitaqService: setCallLimit: actionName, limit', actionName, limit);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('set_call_limit', arguments)
    //     )
    // }
    //
    // /**
    //  * Vitaq command to enable/disable actions
    //  * @param actionName - name of the action to enable/disable
    //  * @param enabled - true sets enabled, false sets disabled
    //  */
    // setEnabled(actionName: string, enabled: boolean) {
    //     log.debug('VitaqService: setEnabled: actionName, enabled', actionName, enabled);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('set_enabled', arguments)
    //     )
    // }
    //
    // /**
    //  * set or clear the exhaustive flag
    //  * @param actionName - name of the action
    //  * @param exhaustive - true sets exhaustive, false clears exhaustive
    //  */
    // setExhaustive(actionName: string, exhaustive: boolean) {
    //     log.debug('VitaqService: setExhaustive: actionName, exhaustive', actionName, exhaustive);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('set_exhaustive', arguments)
    //     )
    // }
    //
    // /**
    //  * Set the maximum allowable recursive depth
    //  * @param actionName - name of the action
    //  * @param depth - Maximum allowable recursive depth
    //  */
    // setMaxActionDepth(actionName: string, depth: number = 1000) {
    //     log.debug('VitaqService: setMaxActionDepth: actionName, depth', actionName, depth);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('set_max_sequence_depth', arguments)
    //     )
    // }
    //
    // /**
    //  * Set the seed to use
    //  * @param variableName - name of the variable
    //  * @param seed - Seed to use
    //  */
    // setSeed(variableName: string, seed: number) {
    //     log.debug('VitaqService: setSeed: variableName, seed', variableName, seed);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('set_seed', arguments)
    //     )
    // }
    //
    // /**
    //  * Manually set a value for a variable
    //  * @param variableName - name of the variable
    //  * @param value - value to set
    //  */
    // setValue(variableName: string, value: number) {
    //     log.debug('VitaqService: setValue: variableName, value', variableName, value);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('set_value', arguments)
    //     )
    // }
    // /**
    //  * Vitaq command to enable/disable actions
    //  * @param actionName - name of tbe action to enable/disable
    //  * @param enabled - true sets enabled, false sets disabled
    //  */
    // setEnabled(actionName: string, enabled: boolean) {
    //     log.debug("VitaqService: setEnabled: actionName, enabled", actionName, enabled);
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller("set_enabled", arguments)
    //     )
    // }
    //
    // /**
    //  * Allow ONLY the passed list of values as the allowable values for the integer variable
    //  * @param variableName - name of the variable
    //  * @param valueList - list of values that should be allowed
    //  */
    // allowOnlyValues(variableName: string, valueList: []) {
    //     log.debug('VitaqService: allowOnlyValues: variableName, valueList', variableName, valueList);
    //     let vtqArguments = {'0': variableName, '1': valueList.length}
    //     for (let index = 0; index < valueList.length; index += 1) {
    //         let key = index + 2
    //         // @ts-ignore
    //         vtqArguments[key.toString()] = valueList[index]
    //     }
    //     // @ts-ignore
    //     return this._browser.call(() =>
    //         this._api.runCommandCaller('allow_only_values', vtqArguments)
    //     )
    // }
    // =========================================================================
    // =========================================================================
    /**
     * gather information about runner
     */
    beforeSession(config, capabilities) {
        log.info("Running the service beforeSession method");
        // this.config = config
        // this.capabilities = capabilities
        // this.api = new VitaqLabs(this.config)
        // this.isRDC = 'testobject_api_key' in this.capabilities
        // this.isServiceEnabled = true
        /**
         * if no user and key is specified even though a sauce service was
         * provided set user and key with values so that the session request
         * will fail (not for RDC tho due to other auth mechansim)
         */
        // if (!this.isRDC && !config.user) {
        //     this.isServiceEnabled = false
        //     config.user = 'unknown_user'
        // }
        // if (!this.isRDC && !config.key) {
        //     this.isServiceEnabled = false
        //     config.key = 'unknown_key'
        // }
    }
    before(config, capabilities, browser) {
        this._browser = browser;
        log.info("Running the service before method");
        // Ensure capabilities are not null in case of multiremote
        // const capabilities = global.browser.capabilities || {}
        // this.isUP = isUnifiedPlatform(capabilities)
    }
};
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFFekMsV0FBVztBQUNYLGFBQWE7QUFDYiw4REFBb0M7QUFRcEMsMkNBQTZDO0FBRzdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxZQUFZO0lBUS9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLDJCQUFlLEVBQUUsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMxRCw0REFBNEQ7UUFDNUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUN2QixhQUFhO1lBQ2IsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtTQUNuRDthQUFNO1lBQ0gsYUFBYTtZQUNiLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUE7U0FDcEQ7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkscUJBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUN2QixhQUFhO1FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLFlBQW9DO1FBQzVFLElBQUksVUFBa0IsQ0FBQztRQUN2QixJQUFJLE1BQU0sR0FBWSxJQUFJLENBQUM7UUFDM0IsSUFBSSxXQUF1QixDQUFDO1FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsS0FBSyxXQUFXO2VBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxHQUFHLEVBQUUsRUFBRTtZQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQy9EO1FBRUQsK0NBQStDO1FBQy9DLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFO1lBQ3JDLHdGQUF3RjtZQUN4RixhQUFhO1lBQ2IsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxLQUFLLFdBQVc7bUJBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxHQUFHLEVBQUUsRUFBRTtnQkFDckMsR0FBRyxDQUFDLElBQUksQ0FBQyxrREFBa0QsRUFBRSxZQUFZLENBQUMsQ0FBQTtnQkFDMUUsR0FBRyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzRjtZQUNELGlEQUFpRDtZQUNqRCxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQy9DLE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDakI7aUJBQU0sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUN0RCxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ2xCO2lCQUFNO2dCQUNILHFDQUFxQztnQkFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnRUFBZ0UsRUFDdEUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3JDLE1BQU0sQ0FBQTthQUNUO1NBQ0o7UUFFRCwwQ0FBMEM7UUFDMUMsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ1osR0FBRyxDQUFDLElBQUksQ0FBQywwREFBMEQsQ0FBQyxDQUFDO1lBRXJFLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFO2dCQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7Z0JBQ3hFLGFBQWE7Z0JBQ2IseUNBQXlDO2dCQUN6QywyREFBMkQ7Z0JBQzNELFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzNFO2lCQUFNO2dCQUNILGFBQWE7Z0JBQ2Isd0RBQXdEO2dCQUN4RCxHQUFHLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEYsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3BGO1lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQywwREFBMEQsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVqRixrQ0FBa0M7WUFDbEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztTQUMzQztJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFFBQVEsQ0FBQyxLQUFpQixFQUFFLFNBQWlCO1FBQ3pDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO1lBQ3pELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxPQUFPLFFBQVEsQ0FBQzthQUNuQjtTQUNKO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxzREFBc0QsRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUNoRixPQUFPLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxTQUFTLG9DQUFvQyxDQUFDLENBQUE7UUFDbEcsT0FBTyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO1FBQy9DLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEVBQVU7UUFDWixHQUFHLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxFQUFFLEVBQUUsR0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRSxhQUFhO1FBQ2IsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDNUIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQ2xELENBQUM7SUFDTixDQUFDO0lBRUQsK0VBQStFO0lBQy9FLDJCQUEyQjtJQUMzQiwrRUFBK0U7SUFDL0UsTUFBTTtJQUNOLHdFQUF3RTtJQUN4RSxnREFBZ0Q7SUFDaEQsTUFBTTtJQUNOLHNDQUFzQztJQUN0QyxvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLG9EQUFvRDtJQUNwRCxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04saUVBQWlFO0lBQ2pFLHVFQUF1RTtJQUN2RSxNQUFNO0lBQ04sdUNBQXVDO0lBQ3ZDLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMseURBQXlEO0lBQ3pELFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTiw0REFBNEQ7SUFDNUQsZ0RBQWdEO0lBQ2hELG1DQUFtQztJQUNuQyxNQUFNO0lBQ04sc0RBQXNEO0lBQ3RELG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsK0RBQStEO0lBQy9ELFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTix3Q0FBd0M7SUFDeEMsd0RBQXdEO0lBQ3hELE1BQU07SUFDTiw0Q0FBNEM7SUFDNUMsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QywwREFBMEQ7SUFDMUQsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHNDQUFzQztJQUN0Qyx1REFBdUQ7SUFDdkQsbUZBQW1GO0lBQ25GLEtBQUs7SUFDTCxnRkFBZ0Y7SUFDaEYsNkJBQTZCO0lBQzdCLE1BQU07SUFDTiw4REFBOEQ7SUFDOUQsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QywrREFBK0Q7SUFDL0QsUUFBUTtJQUNSLElBQUk7SUFFSiw0RUFBNEU7SUFDNUUsd0JBQXdCO0lBQ3hCLDRFQUE0RTtJQUM1RTs7O09BR0c7SUFDSCxXQUFXLENBQUMsWUFBb0I7UUFDNUIsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDeEYsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxjQUFrQjtRQUM3QixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGVBQWUsQ0FBQyxZQUFvQixFQUFFLEtBQVU7UUFDNUMsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ25HLENBQUM7SUFFRDs7O09BR0c7SUFDSCxpQkFBaUIsQ0FBQyxZQUFvQjtRQUNsQyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILG1CQUFtQixDQUFDLE9BQW9CLEVBQUUsTUFBYztRQUNwRCxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDbkcsQ0FBQztJQUVELDRFQUE0RTtJQUM1RSwrQkFBK0I7SUFDL0IsNEVBQTRFO0lBQzVFLHFEQUFxRDtJQUVyRCxpQkFBaUI7SUFDakIsTUFBTSxDQUFDLGNBQWtCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLGdCQUFnQixDQUFDLFlBQW9CLEVBQUUsS0FBVTtRQUM3QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFRCxLQUFLLENBQUMsWUFBb0IsRUFBRSxLQUFVO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDcEQsQ0FBQztJQUVELG9CQUFvQjtJQUNwQixJQUFJLENBQUMsWUFBb0I7UUFDckIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDL0MsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixHQUFHLENBQUMsT0FBb0IsRUFBRSxNQUFjO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUwsZ0ZBQWdGO0lBQ2hGLGlCQUFpQjtJQUNqQixnRkFBZ0Y7SUFFNUUsS0FBSztRQUNELGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzlELENBQUM7SUFFRCxPQUFPLENBQUMsVUFBa0IsRUFBRSxVQUFrQixFQUFFLFNBQWlCLENBQUM7UUFDOUQsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUVELGNBQWMsQ0FBQyxVQUFrQixFQUFFLElBQWE7UUFDNUMsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN6RixDQUFDO0lBRUQsa0JBQWtCLENBQUMsVUFBa0I7UUFDakMsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkYsQ0FBQztJQUVELFlBQVksQ0FBQyxVQUFrQjtRQUMzQixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDakYsQ0FBQztJQUVELFlBQVksQ0FBQyxVQUFrQjtRQUMzQixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDakYsQ0FBQztJQUVELFVBQVUsQ0FBQyxVQUFrQjtRQUN6QixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDL0UsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFrQjtRQUNwQixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUUsQ0FBQztJQUVELFdBQVcsQ0FBQyxVQUFrQjtRQUMxQixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEYsQ0FBQztJQUVELHVCQUF1QixDQUFDLFVBQWtCO1FBQ3RDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzVGLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxVQUFrQjtRQUNoQyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN0RixDQUFDO0lBRUQsYUFBYSxDQUFDLFVBQWtCO1FBQzVCLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsRixDQUFDO0lBRUQsaUJBQWlCLENBQUMsVUFBa0I7UUFDaEMsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdEYsQ0FBQztJQUVELFVBQVUsQ0FBQyxVQUFrQixFQUFFLFVBQWtCO1FBQzdDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDM0YsQ0FBQztJQUVELFlBQVksQ0FBQyxVQUFrQixFQUFFLEtBQWE7UUFDMUMsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN4RixDQUFDO0lBRUQsVUFBVSxDQUFDLFVBQWtCLEVBQUUsT0FBZ0I7UUFDM0MsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN4RixDQUFDO0lBRUQsYUFBYSxDQUFDLFVBQWtCLEVBQUUsVUFBbUI7UUFDakQsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RixDQUFDO0lBRUQsaUJBQWlCLENBQUMsVUFBa0IsRUFBRSxRQUFnQixJQUFJO1FBQ3RELGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3RixDQUFDO0lBRUwsZ0ZBQWdGO0lBQ2hGLGVBQWU7SUFDZixnRkFBZ0Y7SUFFNUUsU0FBUyxDQUFDLFlBQW9CLEVBQUUsSUFBUTtRQUNwQyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RGLENBQUM7SUFFRCxhQUFhLENBQUMsWUFBb0IsRUFBRSxJQUFRO1FBQ3hDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUYsQ0FBQztJQUVELGNBQWMsQ0FBQyxZQUFvQixFQUFFLEdBQVcsRUFBRSxJQUFZO1FBQzFELGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2hHLENBQUM7SUFFRCxjQUFjLENBQUMsWUFBb0IsRUFBRSxLQUFhO1FBQzlDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDNUYsQ0FBQztJQUVELGVBQWUsQ0FBQyxZQUFvQixFQUFFLFNBQWE7UUFDL0MsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqRyxDQUFDO0lBRUQsVUFBVSxDQUFDLFlBQW9CLEVBQUUsR0FBVyxFQUFFLElBQVk7UUFDdEQsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDNUYsQ0FBQztJQUVELFVBQVUsQ0FBQyxZQUFvQixFQUFFLEtBQWE7UUFDMUMsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN4RixDQUFDO0lBRUQsV0FBVyxDQUFDLFlBQW9CLEVBQUUsU0FBYTtRQUMzQyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdGLENBQUM7SUFFRCxhQUFhLENBQUMsWUFBb0IsRUFBRSxHQUFXLEVBQUUsSUFBWTtRQUN6RCxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMvRixDQUFDO0lBRUQsYUFBYSxDQUFDLFlBQW9CLEVBQUUsS0FBYTtRQUM3QyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzNGLENBQUM7SUFFRCxjQUFjLENBQUMsWUFBb0IsRUFBRSxTQUFhO1FBQzlDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUVELFdBQVcsQ0FBQyxZQUFvQixFQUFFLEtBQWM7UUFDNUMsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN6RixDQUFDO0lBRUQsR0FBRyxDQUFDLFlBQW9CO1FBQ3BCLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMxRSxDQUFDO0lBRUQsY0FBYyxDQUFDLFlBQW9CO1FBQy9CLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNyRixDQUFDO0lBRUQsT0FBTyxDQUFDLFlBQW9CO1FBQ3hCLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBRUQsUUFBUSxDQUFDLFlBQW9CO1FBQ3pCLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMvRSxDQUFDO0lBRUQsV0FBVyxDQUFDLFlBQW9CO1FBQzVCLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsRixDQUFDO0lBRUQsT0FBTyxDQUFDLFlBQW9CLEVBQUUsSUFBWTtRQUN0QyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3BGLENBQUM7SUFFRCxRQUFRLENBQUMsWUFBb0IsRUFBRSxLQUFhO1FBQ3hDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdEYsQ0FBQztJQUdELCtFQUErRTtJQUMvRSw0QkFBNEI7SUFDNUIsK0VBQStFO0lBQy9FLE1BQU07SUFDTiw2REFBNkQ7SUFDN0QsTUFBTTtJQUNOLFlBQVk7SUFDWiwwQ0FBMEM7SUFDMUMsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxzRUFBc0U7SUFDdEUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHFEQUFxRDtJQUNyRCw0Q0FBNEM7SUFDNUMsc0VBQXNFO0lBQ3RFLGlFQUFpRTtJQUNqRSxNQUFNO0lBQ04sd0VBQXdFO0lBQ3hFLDBHQUEwRztJQUMxRyxvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLDREQUE0RDtJQUM1RCxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04sbUVBQW1FO0lBQ25FLGdEQUFnRDtJQUNoRCx3REFBd0Q7SUFDeEQsTUFBTTtJQUNOLDhDQUE4QztJQUM5QyxvRkFBb0Y7SUFDcEYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyw4REFBOEQ7SUFDOUQsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLDZEQUE2RDtJQUM3RCxnREFBZ0Q7SUFDaEQsMERBQTBEO0lBQzFELE1BQU07SUFDTixrREFBa0Q7SUFDbEQsd0ZBQXdGO0lBQ3hGLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsbUVBQW1FO0lBQ25FLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTixxRkFBcUY7SUFDckYsZ0RBQWdEO0lBQ2hELDJDQUEyQztJQUMzQyw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLG9FQUFvRTtJQUNwRSxtR0FBbUc7SUFDbkcsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxvRUFBb0U7SUFDcEUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHFGQUFxRjtJQUNyRixnREFBZ0Q7SUFDaEQsNENBQTRDO0lBQzVDLE1BQU07SUFDTix3REFBd0Q7SUFDeEQsMkZBQTJGO0lBQzNGLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsb0VBQW9FO0lBQ3BFLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTiwyRkFBMkY7SUFDM0YsZ0RBQWdEO0lBQ2hELDhEQUE4RDtJQUM5RCxNQUFNO0lBQ04seURBQXlEO0lBQ3pELG9HQUFvRztJQUNwRyxvQkFBb0I7SUFDcEIsb0VBQW9FO0lBQ3BFLGtFQUFrRTtJQUNsRSw4QkFBOEI7SUFDOUIsd0JBQXdCO0lBQ3hCLDBEQUEwRDtJQUMxRCxRQUFRO0lBQ1Isb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyx3RUFBd0U7SUFDeEUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLDRFQUE0RTtJQUM1RSxnREFBZ0Q7SUFDaEQsMkNBQTJDO0lBQzNDLDRDQUE0QztJQUM1QyxNQUFNO0lBQ04sZ0VBQWdFO0lBQ2hFLCtGQUErRjtJQUMvRixvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLCtEQUErRDtJQUMvRCxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04sNEVBQTRFO0lBQzVFLGdEQUFnRDtJQUNoRCw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLG9EQUFvRDtJQUNwRCx1RkFBdUY7SUFDdkYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QywrREFBK0Q7SUFDL0QsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLG9GQUFvRjtJQUNwRixnREFBZ0Q7SUFDaEQsOERBQThEO0lBQzlELE1BQU07SUFDTixxREFBcUQ7SUFDckQsZ0dBQWdHO0lBQ2hHLG9CQUFvQjtJQUNwQixvRUFBb0U7SUFDcEUsa0VBQWtFO0lBQ2xFLDhCQUE4QjtJQUM5Qix3QkFBd0I7SUFDeEIsMERBQTBEO0lBQzFELFFBQVE7SUFDUixvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLG1FQUFtRTtJQUNuRSxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04scUNBQXFDO0lBQ3JDLDRDQUE0QztJQUM1Qyx5REFBeUQ7SUFDekQsTUFBTTtJQUNOLHNEQUFzRDtJQUN0RCxxRkFBcUY7SUFDckYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxvRUFBb0U7SUFDcEUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLGlGQUFpRjtJQUNqRixnREFBZ0Q7SUFDaEQsMkNBQTJDO0lBQzNDLDRDQUE0QztJQUM1QyxNQUFNO0lBQ04sbUVBQW1FO0lBQ25FLGtHQUFrRztJQUNsRyxvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLGtFQUFrRTtJQUNsRSxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04saUZBQWlGO0lBQ2pGLGdEQUFnRDtJQUNoRCw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLHVEQUF1RDtJQUN2RCwwRkFBMEY7SUFDMUYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxrRUFBa0U7SUFDbEUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHlGQUF5RjtJQUN6RixnREFBZ0Q7SUFDaEQsOERBQThEO0lBQzlELE1BQU07SUFDTix3REFBd0Q7SUFDeEQsbUdBQW1HO0lBQ25HLG9CQUFvQjtJQUNwQixvRUFBb0U7SUFDcEUsa0VBQWtFO0lBQ2xFLDhCQUE4QjtJQUM5Qix3QkFBd0I7SUFDeEIsMERBQTBEO0lBQzFELFFBQVE7SUFDUixvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLHNFQUFzRTtJQUN0RSxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04sMkRBQTJEO0lBQzNELDRDQUE0QztJQUM1QyxNQUFNO0lBQ04sMkNBQTJDO0lBQzNDLDZFQUE2RTtJQUM3RSxvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLDBFQUEwRTtJQUMxRSxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04sZ0RBQWdEO0lBQ2hELGdEQUFnRDtJQUNoRCw2REFBNkQ7SUFDN0QsTUFBTTtJQUNOLHNEQUFzRDtJQUN0RCx3RkFBd0Y7SUFDeEYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxpRUFBaUU7SUFDakUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHdEQUF3RDtJQUN4RCxnREFBZ0Q7SUFDaEQsTUFBTTtJQUNOLDhCQUE4QjtJQUM5QixrRUFBa0U7SUFDbEUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyx1REFBdUQ7SUFDdkQsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHdFQUF3RTtJQUN4RSxnREFBZ0Q7SUFDaEQsTUFBTTtJQUNOLGlDQUFpQztJQUNqQyxxRUFBcUU7SUFDckUsb0JBQW9CO0lBQ3BCLCtCQUErQjtJQUMvQix1REFBdUQ7SUFDdkQsUUFBUTtJQUNSLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsNkRBQTZEO0lBQzdELFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTixnREFBZ0Q7SUFDaEQsNENBQTRDO0lBQzVDLE1BQU07SUFDTixxQ0FBcUM7SUFDckMsdUVBQXVFO0lBQ3ZFLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsa0VBQWtFO0lBQ2xFLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTiwrREFBK0Q7SUFDL0QsNENBQTRDO0lBQzVDLE1BQU07SUFDTixxQ0FBcUM7SUFDckMsdUVBQXVFO0lBQ3ZFLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsa0VBQWtFO0lBQ2xFLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTiw2Q0FBNkM7SUFDN0MsZ0RBQWdEO0lBQ2hELE1BQU07SUFDTix5Q0FBeUM7SUFDekMsNkVBQTZFO0lBQzdFLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMscUVBQXFFO0lBQ3JFLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLEVBQUU7SUFDRixzQ0FBc0M7SUFDdEMsdUJBQXVCO0lBQ3ZCLHFGQUFxRjtJQUNyRixPQUFPO0lBQ1AsRUFBRTtJQUNGLFNBQVM7SUFDVCx1Q0FBdUM7SUFDdkMsK0NBQStDO0lBQy9DLFNBQVM7SUFDVCxzQ0FBc0M7SUFDdEMsd0VBQXdFO0lBQ3hFLDZEQUE2RDtJQUM3RCwyRUFBMkU7SUFDM0UsdUJBQXVCO0lBQ3ZCLHlDQUF5QztJQUN6QyxrRUFBa0U7SUFDbEUsV0FBVztJQUNYLE9BQU87SUFDUCxFQUFFO0lBQ0YsTUFBTTtJQUNOLHFDQUFxQztJQUNyQyw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLDhCQUE4QjtJQUM5QixnRUFBZ0U7SUFDaEUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QywwREFBMEQ7SUFDMUQsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHNDQUFzQztJQUN0QyxnREFBZ0Q7SUFDaEQsTUFBTTtJQUNOLGtDQUFrQztJQUNsQyxzRUFBc0U7SUFDdEUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyw0REFBNEQ7SUFDNUQsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLDJDQUEyQztJQUMzQyxnREFBZ0Q7SUFDaEQsTUFBTTtJQUNOLG1DQUFtQztJQUNuQyx1RUFBdUU7SUFDdkUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyw2REFBNkQ7SUFDN0QsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLDBDQUEwQztJQUMxQyw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLG9DQUFvQztJQUNwQyxzRUFBc0U7SUFDdEUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxrRUFBa0U7SUFDbEUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLDhDQUE4QztJQUM5Qyw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLGdEQUFnRDtJQUNoRCxrRkFBa0Y7SUFDbEYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxnRkFBZ0Y7SUFDaEYsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLGdEQUFnRDtJQUNoRCw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLDBDQUEwQztJQUMxQyw0RUFBNEU7SUFDNUUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyx5RUFBeUU7SUFDekUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLGdEQUFnRDtJQUNoRCw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLHNDQUFzQztJQUN0Qyx3RUFBd0U7SUFDeEUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QyxtRUFBbUU7SUFDbkUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLCtDQUErQztJQUMvQyw0Q0FBNEM7SUFDNUMsTUFBTTtJQUNOLDBDQUEwQztJQUMxQyw0RUFBNEU7SUFDNUUsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyx1RUFBdUU7SUFDdkUsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLGtFQUFrRTtJQUNsRSw0Q0FBNEM7SUFDNUMsc0RBQXNEO0lBQ3RELE1BQU07SUFDTix1REFBdUQ7SUFDdkQsNkZBQTZGO0lBQzdGLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsK0RBQStEO0lBQy9ELFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTixzQ0FBc0M7SUFDdEMsZ0RBQWdEO0lBQ2hELE1BQU07SUFDTixzQ0FBc0M7SUFDdEMsMEVBQTBFO0lBQzFFLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsZ0VBQWdFO0lBQ2hFLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTixxREFBcUQ7SUFDckQsNENBQTRDO0lBQzVDLDBDQUEwQztJQUMxQyxNQUFNO0lBQ04sb0RBQW9EO0lBQ3BELHFGQUFxRjtJQUNyRixvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLGtFQUFrRTtJQUNsRSxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04sNkNBQTZDO0lBQzdDLDhEQUE4RDtJQUM5RCw2REFBNkQ7SUFDN0QsTUFBTTtJQUNOLHFEQUFxRDtJQUNyRCx1RkFBdUY7SUFDdkYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0QywrREFBK0Q7SUFDL0QsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHNDQUFzQztJQUN0Qyw0Q0FBNEM7SUFDNUMsdUVBQXVFO0lBQ3ZFLE1BQU07SUFDTiwyREFBMkQ7SUFDM0QsZ0dBQWdHO0lBQ2hHLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsa0VBQWtFO0lBQ2xFLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTiwrQ0FBK0M7SUFDL0MsNENBQTRDO0lBQzVDLHNEQUFzRDtJQUN0RCxNQUFNO0lBQ04sZ0VBQWdFO0lBQ2hFLDBGQUEwRjtJQUMxRixvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLDBFQUEwRTtJQUMxRSxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04seUJBQXlCO0lBQ3pCLGdEQUFnRDtJQUNoRCwrQkFBK0I7SUFDL0IsTUFBTTtJQUNOLGdEQUFnRDtJQUNoRCxrRkFBa0Y7SUFDbEYsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyw0REFBNEQ7SUFDNUQsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsTUFBTTtJQUNOLHlDQUF5QztJQUN6QyxnREFBZ0Q7SUFDaEQsaUNBQWlDO0lBQ2pDLE1BQU07SUFDTixrREFBa0Q7SUFDbEQscUZBQXFGO0lBQ3JGLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsNkRBQTZEO0lBQzdELFFBQVE7SUFDUixJQUFJO0lBR0osTUFBTTtJQUNOLDZDQUE2QztJQUM3Qyw4REFBOEQ7SUFDOUQsNkRBQTZEO0lBQzdELE1BQU07SUFDTixxREFBcUQ7SUFDckQsdUZBQXVGO0lBQ3ZGLG9CQUFvQjtJQUNwQixzQ0FBc0M7SUFDdEMsK0RBQStEO0lBQy9ELFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLE1BQU07SUFDTiwyRkFBMkY7SUFDM0YsZ0RBQWdEO0lBQ2hELDhEQUE4RDtJQUM5RCxNQUFNO0lBQ04seURBQXlEO0lBQ3pELG9HQUFvRztJQUNwRyxvRUFBb0U7SUFDcEUsa0VBQWtFO0lBQ2xFLDhCQUE4QjtJQUM5Qix3QkFBd0I7SUFDeEIsMERBQTBEO0lBQzFELFFBQVE7SUFDUixvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLHdFQUF3RTtJQUN4RSxRQUFRO0lBQ1IsSUFBSTtJQUVKLDRFQUE0RTtJQUM1RSw0RUFBNEU7SUFFNUU7O09BRUc7SUFDSCxhQUFhLENBQUUsTUFBMEIsRUFBRSxZQUEyQztRQUNsRixHQUFHLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUE7UUFDcEQsdUJBQXVCO1FBQ3ZCLG1DQUFtQztRQUNuQyx3Q0FBd0M7UUFDeEMseURBQXlEO1FBQ3pELCtCQUErQjtRQUUvQjs7OztXQUlHO1FBQ0gscUNBQXFDO1FBQ3JDLG9DQUFvQztRQUNwQyxtQ0FBbUM7UUFDbkMsSUFBSTtRQUNKLG9DQUFvQztRQUNwQyxvQ0FBb0M7UUFDcEMsaUNBQWlDO1FBQ2pDLElBQUk7SUFDUixDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQWUsRUFBRSxZQUFxQixFQUFFLE9BQXVEO1FBQ2xHLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtRQUM3QywwREFBMEQ7UUFDMUQseURBQXlEO1FBQ3pELDhDQUE4QztJQUNsRCxDQUFDO0NBcU9KLENBQUE7QUFFRCxnRkFBZ0Y7QUFDaEYsY0FBYztBQUNkLGdGQUFnRiJ9