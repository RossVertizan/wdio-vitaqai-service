// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service')

// Packages
// @ts-ignore
import VitaqAiApi from 'vitaqai_api'

// Type import
import type { Services, Capabilities, Options, Frameworks } from '@wdio/types'
import type { Browser, MultiRemoteBrowser } from 'webdriverio'

// Default options
import { VitaqServiceOptions, MochaSuite } from './types'
import { DEFAULT_OPTIONS } from './constants'
import { validateArguments } from './arguments'

module.exports = class VitaqService implements Services.ServiceInstance {
    private _options: VitaqServiceOptions
    private _capabilities: Capabilities.RemoteCapability
    private _config: Options.Testrunner
    private _counter: number
    private _api: VitaqAiApi
    private _browser?: Browser<'async'> | MultiRemoteBrowser<'async'>

    constructor(
        serviceOptions: VitaqServiceOptions,
        capabilities: Capabilities.RemoteCapability,
        config: Options.Testrunner
    ) {
        log.debug("serviceOptions: ", serviceOptions);
        log.debug("capabilities: ", capabilities);
        log.debug("config: ", config);
        this._options = { ...DEFAULT_OPTIONS, ...serviceOptions };
        // Import either the Sync or Async versions of the functions
        if (this._options.useSync) {
            // @ts-ignore
            this.vitaqFunctions = require('./functionsSync')
        } else {
            // @ts-ignore
            this.vitaqFunctions = require('./functionsAsync')
        }
        this._capabilities = capabilities;
        this._config = config;
        this._api = new VitaqAiApi(this._options)
        this._api.startPython()
        // @ts-ignore
        global.vitaq = this;
        this._counter = 0;
    }

    async nextActionSelector(suite: MochaSuite, currentSuite: MochaSuite | undefined) {
        let nextAction: string;
        let result: boolean = true;
        let returnSuite: MochaSuite;
        if (typeof this._options.verbosityLevel !== 'undefined'
            &&this._options.verbosityLevel > 50) {
            log.info("VitaqService: nextActionSelector: suite: ", suite)
        }

        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            // @ts-ignore
            if (typeof this._options.verbosityLevel !== 'undefined'
                &&this._options.verbosityLevel > 50) {
                log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite)
                log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
            }
            // Map the passed/failed result to true and false
            if (currentSuite.ctx._runnable.state === "passed") {
                result = true;
            } else if (currentSuite.ctx._runnable.state === "failed") {
                result = false;
            } else {
                // Didn't get either passed or failed
                log.error('VitaqService: nextActionSelector: Unexpected value for state: ',
                    currentSuite.ctx._runnable.state)
                result
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
            } else {
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

    /**
     * Create an async sleep statement to test the sync capabilities in our test files
     * @param duration
     * @returns {null|*}
     */
    sleep(ms: number) {
        log.info("VitaqService: sleep: Sleeping for %s seconds", ms/1000);
        // @ts-ignore
        return global.browser.call(() =>
            new Promise(resolve => setTimeout(resolve, ms))
        );
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
    requestData(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.requestData(variableName, this._browser, this._api)
    }

    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray: []) {
        // @ts-ignore
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api)
    }

    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName: string, value: any) {
        // @ts-ignore
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api)
    }

    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName: string) {
        // @ts-ignore
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
        // @ts-ignore
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api)
    }

    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHOD ALIASES
    // -------------------------------------------------------------------------
    // Easier names to use with the Vitaq control methods

    // recordCoverage
    record(variablesArray: []) {
        return this.recordCoverage(variablesArray)
    }

    // sendDataToVitaq
    writeDataToVitaq(variableName: string, value: any) {
        return this.sendDataToVitaq(variableName, value)
    }

    write(variableName: string, value: any) {
        return this.sendDataToVitaq(variableName, value)
    }

    // readDataFromVitaq
    read(variableName: string) {
        return this.readDataFromVitaq(variableName)
    }

    // createVitaqLogEntry
    log(message: string | {}, format: string) {
        return this.createVitaqLogEntry(message, format)
    }

// =============================================================================
// Action Methods
// =============================================================================

    abort() {
        // @ts-ignore
        return this.vitaqFunctions.abort(this._browser, this._api)
    }

    addNext(actionName: string, nextAction: string, weight: number = 1) {
        // @ts-ignore
        return this.vitaqFunctions.addNext(actionName, nextAction, weight, this._browser, this._api)
    }

    clearCallCount(actionName: string, tree: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.clearCallCount(actionName, tree, this._browser, this._api)
    }

    displayNextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.displayNextActions(actionName, this._browser, this._api)
    }

    getCallCount(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getCallCount(actionName, this._browser, this._api)
    }

    getCallLimit(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getCallLimit(actionName, this._browser, this._api)
    }

    getEnabled(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getEnabled(actionName, this._browser, this._api)
    }

    getId(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getId(actionName, this._browser, this._api)
    }

    nextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.nextActions(actionName, this._browser, this._api)
    }

    numberActiveNextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.numberActiveNextActions(actionName, this._browser, this._api)
    }

    numberNextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.numberNextActions(actionName, this._browser, this._api)
    }

    removeAllNext(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.removeAllNext(actionName, this._browser, this._api)
    }

    removeFromCallers(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.removeFromCallers(actionName, this._browser, this._api)
    }

    removeNext(actionName: string, nextAction: string) {
        // @ts-ignore
        return this.vitaqFunctions.removeNext(actionName, nextAction, this._browser, this._api)
    }

    setCallLimit(actionName: string, limit: number) {
        // @ts-ignore
        return this.vitaqFunctions.setCallLimit(actionName, limit, this._browser, this._api)
    }

    setEnabled(actionName: string, enabled: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.setEnabled(actionName, enabled, this._browser, this._api)
    }

    setExhaustive(actionName: string, exhaustive: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.setExhaustive(actionName, exhaustive, this._browser, this._api)
    }

    setMaxActionDepth(actionName: string, depth: number = 1000) {
        // @ts-ignore
        return this.vitaqFunctions.setMaxActionDepth(actionName, depth, this._browser, this._api)
    }

// =============================================================================
// Data Methods
// =============================================================================

    allowList(variableName: string, list: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowList(variableName, list, this._browser, this._api)
    }

    allowOnlyList(variableName: string, list: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyList(variableName, list, this._browser, this._api)
    }

    allowOnlyRange(variableName: string, low: number, high: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyRange(variableName, low, high, this._browser, this._api)
    }

    allowOnlyValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyValue(variableName, value, this._browser, this._api)
    }

    allowOnlyValues(variableName: string, valueList: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyValues(variableName, valueList, this._browser, this._api)
    }

    allowRange(variableName: string, low: number, high: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowRange(variableName, low, high, this._browser, this._api)
    }

    allowValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowValue(variableName, value, this._browser, this._api)
    }

    allowValues(variableName: string, valueList: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowValues(variableName, valueList, this._browser, this._api)
    }

    disallowRange(variableName: string, low: number, high: number) {
        // @ts-ignore
        return this.vitaqFunctions.disallowRange(variableName, low, high, this._browser, this._api)
    }

    disallowValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.disallowValue(variableName, value, this._browser, this._api)
    }

    disallowValues(variableName: string, valueList: []) {
        // @ts-ignore
        return this.vitaqFunctions.disallowValues(variableName, valueList, this._browser, this._api)
    }

    doNotRepeat(variableName: string, value: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.doNotRepeat(variableName, value, this._browser, this._api)
    }

    gen(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.gen(variableName, this._browser, this._api)
    }

    getDoNotRepeat(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getDoNotRepeat(variableName, this._browser, this._api)
    }

    getSeed(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getSeed(variableName, this._browser, this._api)
    }

    getValue(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getValue(variableName, this._browser, this._api)
    }

    resetRanges(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.resetRanges(variableName, this._browser, this._api)
    }

    setSeed(variableName: string, seed: number) {
        // @ts-ignore
        return this.vitaqFunctions.setSeed(variableName, seed, this._browser, this._api)
    }

    setValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.setValue(variableName, value, this._browser, this._api)
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
    beforeSession (config: Options.Testrunner, capabilities: Capabilities.RemoteCapability) {
        log.info("Running the service beforeSession method")
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

    before(config: unknown, capabilities: unknown, browser: Browser<'async'> | MultiRemoteBrowser<'async'>) {
        this._browser = browser
        log.info("Running the service before method")
        // Ensure capabilities are not null in case of multiremote
        // const capabilities = global.browser.capabilities || {}
        // this.isUP = isUnifiedPlatform(capabilities)
    }

    // beforeSuite (suite: Frameworks.Suite) {
    //     log.info("Running the service beforeSuite method")
    //     // this.suiteTitle = suite.title
    //     // if (this.options.setJobNameInBeforeSuite && !this.isUP) {
    //     //     global.browser.execute('sauce:job-name=' + this.suiteTitle)
    //     // }
    // }
    //
    // beforeTest (test: Frameworks.Test) {
    //     log.info("Running the service beforeSession method")
    //     /**
    //      * Date:    20200714
    //      * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
    //      */
    //     // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
    //     //     return
    //     // }
    //
    //     /**
    //      * in jasmine we get Jasmine__TopLevel__Suite as title since service using test
    //      * framework hooks in order to execute async functions.
    //      * This tweak allows us to set the real suite name for jasmine jobs.
    //      */
    //     /* istanbul ignore if */
    //     // if (this.suiteTitle === 'Jasmine__TopLevel__Suite') {
    //     //     this.suiteTitle = test.fullName.slice(0, test.fullName.indexOf(test.description) - 1)
    //     // }
    //
    //     // const fullTitle = (
    //     //     /**
    //     //      * Jasmine
    //     //      */
    //     //     test.fullName ||
    //     //     /**
    //     //      * Mocha
    //     //      */
    //     //     `${test.parent} - ${test.title}`
    //     // )
    //     // global.browser.execute('sauce:context=' + fullTitle)
    // }
    //
    // afterSuite (suite: Frameworks.Suite) {
    //     log.info("Running the service afterSuite method")
    //     // if (Object.prototype.hasOwnProperty.call(suite, 'error')) {
    //     //     ++this.failures
    //     // }
    // }
    //
    // afterTest (test: Frameworks.Test, context, results) {
    //     log.info("Running the service afterTest method")
    //     /**
    //      * remove failure if test was retried and passed
    //      * > Mocha only
    //      */
    //     // if (test._retriedTest && results.passed) {
    //     //     --this.failures
    //     //     return
    //     // }
    //
    //     /**
    //      * don't bump failure number if test was retried and still failed
    //      * > Mocha only
    //      */
    //     // if (test._retriedTest && !results.passed && test._currentRetry < test._retries) {
    //     //     return
    //     // }
    //     //
    //     // if (!results.passed) {
    //     //     ++this.failures
    //     // }
    // }
    //
    // /**
    //  * For CucumberJS
    //  */
    // beforeFeature (uri, feature) {
    //     log.info("Running the service beforeFeature method")
    //     /**
    //      * Date:    20200714
    //      * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
    //      */
    //     // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
    //     //     return
    //     // }
    //     //
    //     // this.suiteTitle = feature.document.feature.name
    //     // global.browser.execute('sauce:context=Feature: ' + this.suiteTitle)
    // }
    //
    // beforeScenario (uri, feature, scenario) {
    //     log.info("Running the service beforeScenario method")
    //     /**
    //      * Date:    20200714
    //      * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
    //      */
    //     // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
    //     //     return
    //     // }
    //     //
    //     // const scenarioName = scenario.name
    //     // global.browser.execute('sauce:context=Scenario: ' + scenarioName)
    // }
    //
    // afterScenario(uri, feature, pickle, result) {
    //     log.info("Running the service afterScenario method")
    //     // if (result.status === 'failed') {
    //     //     ++this.failures
    //     // }
    // }
    //
    // /**
    //  * update Vitaq Labs job
    //  */
    // after (result) {
    //     log.info("Running the service after method")
    //     // if (!this.isServiceEnabled && !this.isRDC) {
    //     //     return
    //     // }
    //     //
    //     // let failures = this.failures
    //     //
    //     // /**
    //     //  * set failures if user has bail option set in which case afterTest and
    //     //  * afterSuite aren't executed before after hook
    //     //  */
    //     // if (global.browser.config.mochaOpts && global.browser.config.mochaOpts.bail && Boolean(result)) {
    //     //     failures = 1
    //     // }
    //     //
    //     // const status = 'status: ' + (failures > 0 ? 'failing' : 'passing')
    //     // if (!global.browser.isMultiremote) {
    //     //     log.info(`Update job with sessionId ${global.browser.sessionId}, ${status}`)
    //     //     return this.isUP ? this.updateUP(failures) : this.updateJob(global.browser.sessionId, failures)
    //     // }
    //     //
    //     // return Promise.all(Object.keys(this.capabilities).map((browserName) => {
    //     //     log.info(`Update multiremote job for browser "${browserName}" and sessionId ${global.browser[browserName].sessionId}, ${status}`)
    //     //     return this.isUP ? this.updateUP(failures) : this.updateJob(global.browser[browserName].sessionId, failures, false, browserName)
    //     // }))
    // }
    //
    // onReload (oldSessionId, newSessionId) {
    //     log.info("Running the service onReload method")
    //     // if (!this.isServiceEnabled && !this.isRDC) {
    //     //     return
    //     // }
    //     //
    //     // const status = 'status: ' + (this.failures > 0 ? 'failing' : 'passing')
    //     //
    //     // if (!global.browser.isMultiremote) {
    //     //     log.info(`Update (reloaded) job with sessionId ${oldSessionId}, ${status}`)
    //     //     return this.updateJob(oldSessionId, this.failures, true)
    //     // }
    //     //
    //     // const browserName = global.browser.instances.filter(
    //     //     (browserName) => global.browser[browserName].sessionId === newSessionId)[0]
    //     // log.info(`Update (reloaded) multiremote job for browser "${browserName}" and sessionId ${oldSessionId}, ${status}`)
    //     // return this.updateJob(oldSessionId, this.failures, true, browserName)
    // }
    //
    // async updateJob (sessionId, failures, calledOnReload = false, browserName) {
    //     log.info("Running the service updateJob method")
    //     // if (this.isRDC) {
    //     //     await this.api.updateTest(sessionId, { passed: failures === 0 })
    //     //     this.failures = 0
    //     //     return
    //     // }
    //     //
    //     // const body = this.getBody(failures, calledOnReload, browserName)
    //     // await this.api.updateJob(this.config.user, sessionId, body)
    //     // this.failures = 0
    // }
    //
    // /**
    //  * VM message data
    //  */
    // getBody (failures, calledOnReload = false, browserName) {
    //     log.info("Running the service getBody method")
    //     // let body = {}
    //     //
    //     // /**
    //     //  * set default values
    //     //  */
    //     // body.name = this.suiteTitle
    //     //
    //     // if (browserName) {
    //     //     body.name = `${browserName}: ${body.name}`
    //     // }
    //     //
    //     // /**
    //     //  * add reload count to title if reload is used
    //     //  */
    //     // if (calledOnReload || this.testCnt) {
    //     //     let testCnt = ++this.testCnt
    //     //
    //     //     if (global.browser.isMultiremote) {
    //     //         testCnt = Math.ceil(testCnt / global.browser.instances.length)
    //     //     }
    //     //
    //     //     body.name += ` (${testCnt})`
    //     // }
    //     //
    //     // let caps = this.capabilities['sauce:options'] || this.capabilities
    //     //
    //     // for (let prop of jobDataProperties) {
    //     //     if (!caps[prop]) {
    //     //         continue
    //     //     }
    //     //
    //     //     body[prop] = caps[prop]
    //     // }
    //     //
    //     // body.passed = failures === 0
    //     // return body
    // }
    //
    // /**
    //  * Update the UP with the JS-executor
    //  * @param {number} failures
    //  * @returns {*}
    //  */
    // updateUP(failures){
    //     log.info("Running the service updateUP method")
    //     // return global.browser.execute(`sauce:job-result=${failures === 0}`)
    // }


}

// =============================================================================
// END OF FILE
// =============================================================================
