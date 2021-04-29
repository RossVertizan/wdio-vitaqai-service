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
     * Provide a simple sleep command
     * @param duration
     */
    sleep(ms) {
        // @ts-ignore
        return this.vitaqFunctions.sleep(ms, this._browser);
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
        return this.vitaqFunctions.requestData(variableName, this._browser, this._api);
    }
    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray) {
        // @ts-ignore
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api);
    }
    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName, value) {
        // @ts-ignore
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api);
    }
    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName) {
        // @ts-ignore
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
        // @ts-ignore
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api);
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
    abort(actionName) {
        // @ts-ignore
        return this.vitaqFunctions.abort(actionName, this._browser, this._api);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFFekMsV0FBVztBQUNYLGFBQWE7QUFDYiw4REFBb0M7QUFRcEMsMkNBQTZDO0FBRzdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxZQUFZO0lBUS9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLDJCQUFlLEVBQUUsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMxRCw0REFBNEQ7UUFDNUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUN2QixhQUFhO1lBQ2IsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtTQUNuRDthQUFNO1lBQ0gsYUFBYTtZQUNiLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUE7U0FDcEQ7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkscUJBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFD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