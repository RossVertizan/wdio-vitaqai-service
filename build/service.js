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
        log.info("VitaqService: nextActionSelector: suite: ", suite);
        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite);
            log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
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
    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHODS
    // -------------------------------------------------------------------------
    /**
     * Get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    requestData(variableName) {
        // @ts-ignore
        return this._browser.call(() => this._api.requestDataCaller(variableName));
    }
    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray) {
        // @ts-ignore
        return this._browser.call(() => this._api.recordCoverageCaller(variablesArray));
    }
    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName, value) {
        // @ts-ignore
        return this._browser.call(() => this._api.sendDataToVitaqCaller(variableName, value));
    }
    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName) {
        // @ts-ignore
        return this._browser.call(() => this._api.readDataFromVitaqCaller(variableName));
    }
    /**
     * Create an entry in the Vitaq log
     * @param message - message/data to put into the log
     * @param format - format of the message/data, can be "text" (default) or "json"
     */
    createVitaqLogEntry(message, format) {
        // @ts-ignore
        return this._browser.call(() => this._api.createVitaqLogEntryCaller(message, format));
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
    // -------------------------------------------------------------------------
    // STANDARD VITAQ METHODS
    // -------------------------------------------------------------------------
    /**
     * Abort the action causing it to not select a next action
     */
    abort() {
        log.debug('VitaqService: abort: ');
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('abort', { '0': 'currentAction' }));
    }
    /**
     * Add an action that can be called after this one
     * @param actionName - name of the action
     * @param nextAction - name of the action that could be called next
     * @param weight - Weight for the selection of the next action
     */
    addNext(actionName, nextAction, weight = 1) {
        log.debug('VitaqService: addNext: actionName, nextAction, weight', actionName, nextAction, weight);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('add_next', arguments));
    }
    /**
     * Specify a list to add to the existing list in a list variable
     * @param variableName - name of the variable
     * @param list - The list to add to the existing list
     */
    allowList(variableName, list) {
        log.debug('VitaqService: allowList: variableName, list', variableName, list);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_list', arguments));
    }
    /**[]
     * Specify the ONLY list to select from in a list variable
     * @param variableName - name of the variable
     * @param list - The list to be used for selecting from
     */
    allowOnlyList(variableName, list) {
        log.debug('VitaqService: allowOnlyList: variableName, list', variableName, list);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_only_list', arguments));
    }
    /**
     * Allow ONLY the defined range to be the allowable range for the integer variable
     * @param variableName - name of the variable
     * @param low - Lower limit of the range
     * @param high - Upper limit of the range
     */
    allowOnlyRange(variableName, low, high) {
        log.debug('VitaqService: allowOnlyRange: variableName, low, high', variableName, low, high);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_only_range', arguments));
    }
    /**
     * Allow ONLY the defined value to be the allowable value for the integer variable
     * @param variableName - name of the variable
     * @param value - The value to be allowed
     */
    allowOnlyValue(variableName, value) {
        log.debug('VitaqService: allowOnlyValue: variableName, value', variableName, value);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_only_value', arguments));
    }
    /**
     * Allow ONLY the passed list of values as the allowable values for the integer variable
     * @param variableName - name of the variable
     * @param valueList - list of values that should be allowed
     */
    allowOnlyValues(variableName, valueList) {
        log.debug('VitaqService: allowOnlyValues: variableName, valueList', variableName, valueList);
        // @ts-ignore
        let vtqArguments = { '0': variableName, '1': valueList.length };
        for (let index = 0; index < valueList.length; index += 1) {
            let key = index + 2;
            // @ts-ignore
            vtqArguments[key.toString()] = valueList[index];
        }
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_only_values', vtqArguments));
    }
    /**
     * Add the defined range to the allowable values for the integer variable
     * @param variableName - name of the variable
     * @param low - Lower limit of the range
     * @param high - Upper limit of the range
     */
    allowRange(variableName, low, high) {
        log.debug('VitaqService: allowRange: variableName, low, high', variableName, low, high);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_range', arguments));
    }
    /**
     * Add the defined value to the allowable values for the integer variable
     * @param variableName - name of the variable
     * @param value - The value to be allowed
     */
    allowValue(variableName, value) {
        log.debug('VitaqService: allowValue: variableName, value', variableName, value);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_value', arguments));
    }
    /**
     * Add the passed list of values to the allowable values for the integer variable
     * @param variableName - name of the variable
     * @param valueList - list of values that should be allowed
     */
    allowValues(variableName, valueList) {
        log.debug('VitaqService: allowValues: variableName, valueList', variableName, valueList);
        // @ts-ignore
        let vtqArguments = { '0': variableName, '1': valueList.length };
        for (let index = 0; index < valueList.length; index += 1) {
            let key = index + 2;
            // @ts-ignore
            vtqArguments[key.toString()] = valueList[index];
        }
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('allow_values', vtqArguments));
    }
    /**
     * Set the call_count back to zero
     * @param actionName - name of the action
     * @param tree - clear call counts on all next actions
     */
    clearCallCount(actionName, tree) {
        log.debug('VitaqService: clearCallCount: actionName, tree', actionName, tree);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('clear_call_count', arguments));
    }
    /**
     * Remove the defined range from the allowable values for the integer variable
     * @param variableName - name of the variable
     * @param low - Lower limit of the range
     * @param high - Upper limit of the range
     */
    disallowRange(variableName, low, high) {
        log.debug('VitaqService: disallowRange: variableName, low, high', variableName, low, high);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('disallow_range', arguments));
    }
    /**
     * Remove the defined value from the allowable values for the integer variable
     * @param variableName - name of the variable
     * @param value - The value to be removed
     */
    disallowValue(variableName, value) {
        log.debug('VitaqService: disallowValue: variableName, value', variableName, value);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('disallow_value', arguments));
    }
    /**
     * Remove the passed list of values from the allowable values for the integer variable
     * @param variableName - name of the variable
     * @param valueList - list of values that should be removed
     */
    disallowValues(variableName, valueList) {
        log.debug('VitaqService: disallowValues: variableName, valueList', variableName, valueList);
        // @ts-ignore
        let vtqArguments = { '0': variableName, '1': valueList.length };
        for (let index = 0; index < valueList.length; index += 1) {
            let key = index + 2;
            // @ts-ignore
            vtqArguments[key.toString()] = valueList[index];
        }
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('disallow_values', vtqArguments));
    }
    /**
     * Get a string listing all of the possible next actions
     * @param actionName - name of the action
     */
    displayNextActions(actionName) {
        log.debug('VitaqService: displayNextActions: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('display_next_sequences', arguments));
    }
    /**
     * Specify that values should not be repeated
     * @param variableName - name of the variable
     * @param value - true prevents values from being repeated
     */
    doNotRepeat(variableName, value) {
        log.debug('VitaqService: doNotRepeat: variableName, value', variableName, value);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('do_not_repeat', arguments));
    }
    /**
     * get Vitaq to generate a new value for the variable
     * @param variableName - name of the variable
     */
    gen(variableName) {
        log.debug('VitaqService: gen: variableName', variableName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('gen', arguments));
    }
    /**
     * get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    getGen(variableName) {
        log.debug('VitaqService: getGen: variableName', variableName);
        // @ts-ignore
        this._browser.call(() => this._api.runCommandCaller('gen', arguments));
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_value', arguments));
    }
    /**
     * Get the current call count for this action
     * @param actionName - name of the action
     */
    getCallCount(actionName) {
        log.debug('VitaqService: getCallCount: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_call_count', arguments));
    }
    /**
     * Get the maximum number of times this action can be called
     * @param actionName - name of the action
     */
    getCallLimit(actionName) {
        log.debug('VitaqService: getCallLimit: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_call_limit', arguments));
    }
    /**
     * Get the current status of do not repeat
     * @param variableName - name of the variable
     */
    getDoNotRepeat(variableName) {
        log.debug('VitaqService: getDoNotRepeat: variableName', variableName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_do_not_repeat', arguments));
    }
    /**
     * Query if the action is enabled
     * @param actionName - name of the action
     */
    getEnabled(actionName) {
        log.debug('VitaqService: getEnabled: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_enabled', arguments));
    }
    /**
     * Get a unique ID for this action
     * @param actionName - name of the action
     */
    getId(actionName) {
        log.debug('VitaqService: getId: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_id', arguments));
    }
    /**
     * Get the starting seed being used
     * @param variableName - name of the variable
     */
    getSeed(variableName) {
        log.debug('VitaqService: getSeed: variableName', variableName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_seed', arguments));
    }
    /**
     * Get the current value of the variable
     * @param variableName - name of the variable
     */
    getValue(variableName) {
        log.debug('VitaqService: getValue: variableName', variableName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('get_value', arguments));
    }
    /**
     * Get all of the possible next actions
     * @param actionName - name of the action
     */
    nextActions(actionName) {
        log.debug('VitaqService: nextActions: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('next_sequences', arguments));
    }
    /**
     * Return the number of active next actions
     * @param actionName - name of the action
     */
    numberActiveNextActions(actionName) {
        log.debug('VitaqService: numberActiveNextActions: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('number_active_next_sequences', arguments));
    }
    /**
     * Return the number of possible next actions
     * @param actionName - name of the action
     */
    numberNextActions(actionName) {
        log.debug('VitaqService: numberNextActions: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('number_next_sequences', arguments));
    }
    /**
     * Remova all actions in the next action list
     * @param actionName - name of the action
     */
    removeAllNext(actionName) {
        log.debug('VitaqService: removeAllNext: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('remove_all_next', arguments));
    }
    /**
     * Remove this action from all callers lists
     * @param actionName - name of the action
     */
    removeFromCallers(actionName) {
        log.debug('VitaqService: removeFromCallers: actionName', actionName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('remove_from_callers', arguments));
    }
    /**
     * Remove an existing next action from the list of next actions
     * @param actionName - name of the action
     * @param nextAction - name of the action to remove
     */
    removeNext(actionName, nextAction) {
        log.debug('VitaqService: removeNext: actionName, nextAction', actionName, nextAction);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('remove_next', arguments));
    }
    /**
     * Remove all constraints on values
     * @param variableName - name of the variable
     */
    resetRanges(variableName) {
        log.debug('VitaqService: resetRanges: variableName', variableName);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('reset_ranges', arguments));
    }
    /**
     * Set the maximum number of calls for this action
     * @param actionName - name of the action
     * @param limit - the call limit to set
     */
    setCallLimit(actionName, limit) {
        log.debug('VitaqService: setCallLimit: actionName, limit', actionName, limit);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('set_call_limit', arguments));
    }
    /**
     * Vitaq command to enable/disable actions
     * @param actionName - name of the action to enable/disable
     * @param enabled - true sets enabled, false sets disabled
     */
    setEnabled(actionName, enabled) {
        log.debug('VitaqService: setEnabled: actionName, enabled', actionName, enabled);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('set_enabled', arguments));
    }
    /**
     * set or clear the exhaustive flag
     * @param actionName - name of the action
     * @param exhaustive - true sets exhaustive, false clears exhaustive
     */
    setExhaustive(actionName, exhaustive) {
        log.debug('VitaqService: setExhaustive: actionName, exhaustive', actionName, exhaustive);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('set_exhaustive', arguments));
    }
    /**
     * Set the maximum allowable recursive depth
     * @param actionName - name of the action
     * @param depth - Maximum allowable recursive depth
     */
    setMaxActionDepth(actionName, depth = 1000) {
        log.debug('VitaqService: setMaxActionDepth: actionName, depth', actionName, depth);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('set_max_sequence_depth', arguments));
    }
    /**
     * Set the seed to use
     * @param variableName - name of the variable
     * @param seed - Seed to use
     */
    setSeed(variableName, seed) {
        log.debug('VitaqService: setSeed: variableName, seed', variableName, seed);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('set_seed', arguments));
    }
    /**
     * Manually set a value for a variable
     * @param variableName - name of the variable
     * @param value - value to set
     */
    setValue(variableName, value) {
        log.debug('VitaqService: setValue: variableName, value', variableName, value);
        // @ts-ignore
        return this._browser.call(() => this._api.runCommandCaller('set_value', arguments));
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFFekMsV0FBVztBQUNYLGFBQWE7QUFDYiw4REFBb0M7QUFRcEMsMkNBQTZDO0FBRTdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxZQUFZO0lBUS9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLDJCQUFlLEVBQUUsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkscUJBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUN2QixhQUFhO1FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLFlBQW9DO1FBQzVFLElBQUksVUFBa0IsQ0FBQztRQUN2QixJQUFJLE1BQU0sR0FBWSxJQUFJLENBQUM7UUFDM0IsSUFBSSxXQUF1QixDQUFDO1FBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFNUQsK0NBQStDO1FBQy9DLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFO1lBQ3JDLHdGQUF3RjtZQUN4RixHQUFHLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxFQUFFLFlBQVksQ0FBQyxDQUFBO1lBQzFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkNBQTJDLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEYsaURBQWlEO1lBQ2pELElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDL0MsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNqQjtpQkFBTSxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ3RELE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDbEI7aUJBQU07Z0JBQ0gscUNBQXFDO2dCQUNyQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdFQUFnRSxFQUN0RSxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDckMsTUFBTSxDQUFBO2FBQ1Q7U0FDSjtRQUVELDBDQUEwQztRQUMxQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDWixHQUFHLENBQUMsSUFBSSxDQUFDLDBEQUEwRCxDQUFDLENBQUM7WUFFckUsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUU7Z0JBQ3JDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNkRBQTZELENBQUMsQ0FBQztnQkFDeEUsYUFBYTtnQkFDYix5Q0FBeUM7Z0JBQ3pDLDJEQUEyRDtnQkFDM0QsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDM0U7aUJBQU07Z0JBQ0gsYUFBYTtnQkFDYix3REFBd0Q7Z0JBQ3hELEdBQUcsQ0FBQyxJQUFJLENBQUMscURBQXFELEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwRixVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDcEY7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLDBEQUEwRCxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRWpGLGtDQUFrQztZQUNsQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzNDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsUUFBUSxDQUFDLEtBQWlCLEVBQUUsU0FBaUI7UUFDekMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDekQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLE9BQU8sUUFBUSxDQUFDO2FBQ25CO1NBQ0o7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLHNEQUFzRCxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQ2hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLFNBQVMsb0NBQW9DLENBQUMsQ0FBQTtRQUNsRyxPQUFPLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7UUFDL0MsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsRUFBVTtRQUNaLEdBQUcsQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsRUFBRSxHQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xFLGFBQWE7UUFDYixPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUM1QixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FDbEQsQ0FBQztJQUNOLENBQUM7SUFFRCw0RUFBNEU7SUFDNUUsd0JBQXdCO0lBQ3hCLDRFQUE0RTtJQUM1RTs7O09BR0c7SUFDSCxXQUFXLENBQUMsWUFBb0I7UUFDNUIsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQzVDLENBQUE7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsY0FBYyxDQUFDLGNBQWtCO1FBQzdCLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUNqRCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsWUFBb0IsRUFBRSxLQUFVO1FBQzVDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FDdkQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxpQkFBaUIsQ0FBQyxZQUFvQjtRQUNsQyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsQ0FDbEQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsbUJBQW1CLENBQUMsT0FBb0IsRUFBRSxNQUFjO1FBQ3BELGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FDdkQsQ0FBQTtJQUNMLENBQUM7SUFFRCw0RUFBNEU7SUFDNUUsK0JBQStCO0lBQy9CLDRFQUE0RTtJQUM1RSxxREFBcUQ7SUFFckQsaUJBQWlCO0lBQ2pCLE1BQU0sQ0FBQyxjQUFrQjtRQUNyQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUVELGtCQUFrQjtJQUNsQixnQkFBZ0IsQ0FBQyxZQUFvQixFQUFFLEtBQVU7UUFDN0MsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQW9CLEVBQUUsS0FBVTtRQUNsQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFRCxvQkFBb0I7SUFDcEIsSUFBSSxDQUFDLFlBQW9CO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQy9DLENBQUM7SUFFRCxzQkFBc0I7SUFDdEIsR0FBRyxDQUFDLE9BQW9CLEVBQUUsTUFBYztRQUNwQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDcEQsQ0FBQztJQUdELDRFQUE0RTtJQUM1RSx5QkFBeUI7SUFDekIsNEVBQTRFO0lBQzVFOztPQUVHO0lBQ0gsS0FBSztRQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNuQyxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsZUFBZSxFQUFDLENBQUMsQ0FDOUQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBQyxVQUFrQixFQUFFLFVBQWtCLEVBQUUsU0FBaUIsQ0FBQztRQUM5RCxHQUFHLENBQUMsS0FBSyxDQUFDLHVEQUF1RCxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkcsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUNwRCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLENBQUMsWUFBb0IsRUFBRSxJQUFRO1FBQ3BDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkNBQTZDLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdFLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FDdEQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFDLFlBQW9CLEVBQUUsSUFBUTtRQUN4QyxHQUFHLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsQ0FDM0QsQ0FBQTtJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxZQUFvQixFQUFFLEdBQVcsRUFBRSxJQUFZO1FBQzFELEdBQUcsQ0FBQyxLQUFLLENBQUMsdURBQXVELEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FDNUQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLFlBQW9CLEVBQUUsS0FBYTtRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FDNUQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLFlBQW9CLEVBQUUsU0FBYTtRQUMvQyxHQUFHLENBQUMsS0FBSyxDQUFDLHdEQUF3RCxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3RixhQUFhO1FBQ2IsSUFBSSxZQUFZLEdBQUcsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFDLENBQUE7UUFDN0QsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtZQUN0RCxJQUFJLEdBQUcsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO1lBQ25CLGFBQWE7WUFDYixZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQ2xEO1FBQ0QsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLENBQ2hFLENBQUE7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxVQUFVLENBQUMsWUFBb0IsRUFBRSxHQUFXLEVBQUUsSUFBWTtRQUN0RCxHQUFHLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEYsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUN2RCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsWUFBb0IsRUFBRSxLQUFhO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsK0NBQStDLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hGLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FDdkQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLFlBQW9CLEVBQUUsU0FBYTtRQUMzQyxHQUFHLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6RixhQUFhO1FBQ2IsSUFBSSxZQUFZLEdBQUcsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFDLENBQUE7UUFDN0QsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtZQUN0RCxJQUFJLEdBQUcsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO1lBQ25CLGFBQWE7WUFDYixZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQ2xEO1FBQ0QsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUMzRCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxjQUFjLENBQUMsVUFBa0IsRUFBRSxJQUFhO1FBQzVDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0RBQWdELEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlFLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUM1RCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsYUFBYSxDQUFDLFlBQW9CLEVBQUUsR0FBVyxFQUFFLElBQVk7UUFDekQsR0FBRyxDQUFDLEtBQUssQ0FBQyxzREFBc0QsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNGLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUMxRCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhLENBQUMsWUFBb0IsRUFBRSxLQUFhO1FBQzdDLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0RBQWtELEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25GLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUMxRCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxjQUFjLENBQUMsWUFBb0IsRUFBRSxTQUFhO1FBQzlDLEdBQUcsQ0FBQyxLQUFLLENBQUMsdURBQXVELEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVGLGFBQWE7UUFDYixJQUFJLFlBQVksR0FBRyxFQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUMsQ0FBQTtRQUM3RCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO1lBQ3RELElBQUksR0FBRyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7WUFDbkIsYUFBYTtZQUNiLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7U0FDbEQ7UUFDRCxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUMsQ0FDOUQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxrQkFBa0IsQ0FBQyxVQUFrQjtRQUNqQyxHQUFHLENBQUMsS0FBSyxDQUFDLDhDQUE4QyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RFLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixFQUFFLFNBQVMsQ0FBQyxDQUNsRSxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxXQUFXLENBQUMsWUFBb0IsRUFBRSxLQUFjO1FBQzVDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0RBQWdELEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pGLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FDekQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxHQUFHLENBQUMsWUFBb0I7UUFDcEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMzRCxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQy9DLENBQUE7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLFlBQW9CO1FBQ3ZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDOUQsYUFBYTtRQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FDL0MsQ0FBQTtRQUNELGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FDckQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUFZLENBQUMsVUFBa0I7UUFDM0IsR0FBRyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNoRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FDMUQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUFZLENBQUMsVUFBa0I7UUFDM0IsR0FBRyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNoRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FDMUQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxjQUFjLENBQUMsWUFBb0I7UUFDL0IsR0FBRyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0RSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsQ0FDN0QsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVLENBQUMsVUFBa0I7UUFDekIsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RCxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQ3ZELENBQUE7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFVBQWtCO1FBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDekQsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUNsRCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE9BQU8sQ0FBQyxZQUFvQjtRQUN4QixHQUFHLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQy9ELGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FDcEQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRLENBQUMsWUFBb0I7UUFDekIsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQ3JELENBQUE7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsV0FBVyxDQUFDLFVBQWtCO1FBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUNBQXVDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0QsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQzFELENBQUE7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsdUJBQXVCLENBQUMsVUFBa0I7UUFDdEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtREFBbUQsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMzRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyw4QkFBOEIsRUFBRSxTQUFTLENBQUMsQ0FDeEUsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxpQkFBaUIsQ0FBQyxVQUFrQjtRQUNoQyxHQUFHLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JFLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixFQUFFLFNBQVMsQ0FBQyxDQUNqRSxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxVQUFrQjtRQUM1QixHQUFHLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUMzRCxDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILGlCQUFpQixDQUFDLFVBQWtCO1FBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkNBQTZDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckUsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEVBQUUsU0FBUyxDQUFDLENBQy9ELENBQUE7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxVQUFrQixFQUFFLFVBQWtCO1FBQzdDLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0RBQWtELEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RGLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FDdkQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsWUFBb0I7UUFDNUIsR0FBRyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNuRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQ3hELENBQUE7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxVQUFrQixFQUFFLEtBQWE7UUFDMUMsR0FBRyxDQUFDLEtBQUssQ0FBQywrQ0FBK0MsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUUsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQzFELENBQUE7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxVQUFrQixFQUFFLE9BQWdCO1FBQzNDLEdBQUcsQ0FBQyxLQUFLLENBQUMsK0NBQStDLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hGLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FDdkQsQ0FBQTtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFDLFVBQWtCLEVBQUUsVUFBbUI7UUFDakQsR0FBRyxDQUFDLEtBQUssQ0FBQyxxREFBcUQsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDekYsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQzFELENBQUE7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGlCQUFpQixDQUFDLFVBQWtCLEVBQUUsUUFBZ0IsSUFBSTtRQUN0RCxHQUFHLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRixhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLENBQUMsQ0FDbEUsQ0FBQTtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLFlBQW9CLEVBQUUsSUFBWTtRQUN0QyxHQUFHLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQ3BELENBQUE7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxZQUFvQixFQUFFLEtBQWE7UUFDeEMsR0FBRyxDQUFDLEtBQUssQ0FBQyw2Q0FBNkMsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUUsYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUNyRCxDQUFBO0lBQ0wsQ0FBQztJQVFELE1BQU07SUFDTiw2Q0FBNkM7SUFDN0MsOERBQThEO0lBQzlELDZEQUE2RDtJQUM3RCxNQUFNO0lBQ04scURBQXFEO0lBQ3JELHVGQUF1RjtJQUN2RixvQkFBb0I7SUFDcEIsc0NBQXNDO0lBQ3RDLCtEQUErRDtJQUMvRCxRQUFRO0lBQ1IsSUFBSTtJQUNKLEVBQUU7SUFDRixNQUFNO0lBQ04sMkZBQTJGO0lBQzNGLGdEQUFnRDtJQUNoRCw4REFBOEQ7SUFDOUQsTUFBTTtJQUNOLHlEQUF5RDtJQUN6RCxvR0FBb0c7SUFDcEcsb0VBQW9FO0lBQ3BFLGtFQUFrRTtJQUNsRSw4QkFBOEI7SUFDOUIsd0JBQXdCO0lBQ3hCLDBEQUEwRDtJQUMxRCxRQUFRO0lBQ1Isb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyx3RUFBd0U7SUFDeEUsUUFBUTtJQUNSLElBQUk7SUFFSiw0RUFBNEU7SUFDNUUsNEVBQTRFO0lBRTVFOztPQUVHO0lBQ0gsYUFBYSxDQUFFLE1BQTBCLEVBQUUsWUFBMkM7UUFDbEYsR0FBRyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO1FBQ3BELHVCQUF1QjtRQUN2QixtQ0FBbUM7UUFDbkMsd0NBQXdDO1FBQ3hDLHlEQUF5RDtRQUN6RCwrQkFBK0I7UUFFL0I7Ozs7V0FJRztRQUNILHFDQUFxQztRQUNyQyxvQ0FBb0M7UUFDcEMsbUNBQW1DO1FBQ25DLElBQUk7UUFDSixvQ0FBb0M7UUFDcEMsb0NBQW9DO1FBQ3BDLGlDQUFpQztRQUNqQyxJQUFJO0lBQ1IsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFlLEVBQUUsWUFBcUIsRUFBRSxPQUF1RDtRQUNsRyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtRQUN2QixHQUFHLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUE7UUFDN0MsMERBQTBEO1FBQzFELHlEQUF5RDtRQUN6RCw4Q0FBOEM7SUFDbEQsQ0FBQztDQXFPSixDQUFBO0FBRUQsZ0ZBQWdGO0FBQ2hGLGNBQWM7QUFDZCxnRkFBZ0YifQ==