import {validateArguments} from "./arguments";

// Type import
// @ts-ignore
import VitaqAiApi from 'vitaqai_api'
import type { Browser, MultiRemoteBrowser } from 'webdriverio'

// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service')

// /**
//  * Query if the action is enabled
//  * @param actionName - name of the action
//  * @param browser
//  * @param api
//  */
// export async function getEnabled(actionName: string,
//                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> ,
//                            api: VitaqAiApi) {
//     let args: any [] = Array.from(arguments);
//     args.splice(-2, 2)
//     log.debug('VitaqService: getEnabled: actionName', actionName);
//     let argumentsDescription = {"actionName": "string"}
//     validateArguments("getEnabled", argumentsDescription, args);
//     // @ts-ignore
//     return await api.runCommandCaller('get_enabled', args)
// }

// =============================================================================
// VITAQ CONTROL METHODS
// =============================================================================
/**
 * Get Vitaq to generate a new value for the variable and then get it
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function requestData(variableName: string,
                            browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                            api: VitaqAiApi) {
    return await api.requestDataCaller(variableName)
}

/**
 * Get Vitaq to record coverage for the variables in the array
 * @param variablesArray - array of variables to record coverage for
 * @param browser
 * @param api
 */
export async function recordCoverage(variablesArray: [],
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                               api: VitaqAiApi) {
    return await api.recordCoverageCaller(variablesArray)
}

/**
 * Send data to Vitaq and record it on the named variable
 * @param variableName - name of the variable
 * @param value - value to store
 * @param browser
 * @param api
 */
export async function sendDataToVitaq(variableName: string, value: any,
                                browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                api: VitaqAiApi) {
    return await api.sendDataToVitaqCaller(variableName, value)
}

/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
export async function readDataFromVitaq(variableName: string,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                  api: VitaqAiApi) {
    return await api.readDataFromVitaqCaller(variableName)
}

/**
 * Create an entry in the Vitaq log
 *
 * When using the JSON option the JSON data needs to be stringified using the
 * JSON.stringify() method
 * @param message - message/data to put into the log
 * @param format - format of the message/data, can be "text" (default) or "json"
 * @param browser
 * @param api
 */
export async function createVitaqLogEntry(message: string | {}, format: string,
                                    browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                    api: VitaqAiApi) {
    return await api.createVitaqLogEntryCaller(message, format)
}

// =============================================================================
// Action Methods
// =============================================================================

/**
 * Abort the action causing it to not select a next action
 */
export async function abort(browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                            api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: abort: ', );
    let argumentsDescription = {}
    validateArguments('abort', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('abort', args)
}

/**
 * Add an action that can be called after this one
 * @param actionName - name of the action
 * @param nextAction - name of the action that could be called next
 * @param weight - Weight for the selection of the next action
 * @param browser
 * @param api
 */
export async function addNext(actionName: string, nextAction: string, weight: number = 1,
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    let argumentsDescription = {"actionName": "string", "nextAction": "string", "weight": "number"}
    validateArguments('addNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('add_next', args)
}

/**
 * Set the call_count back to zero
 * @param actionName - name of the action
 * @param tree - clear call counts on all next actions
 * @param browser
 * @param api
 */
export async function clearCallCount(actionName: string, tree: boolean,
                                     browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                     api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: clearCallCount: actionName, tree', actionName, tree);
    let argumentsDescription = {"actionName": "string", "tree?": "boolean"}
    validateArguments('clearCallCount', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('clear_call_count', args)
}

/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function displayNextActions(actionName: string,
                                         browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                         api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: displayNextActions: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('displayNextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('display_next_sequences', args)
}

/**
 * Get the current call count for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getCallCount(actionName: string,
                                   browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                   api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getCallCount: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('getCallCount', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_call_count', args)
}

/**
 * Get the maximum number of times this action can be called
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getCallLimit(actionName: string,
                                   browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                   api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getCallLimit: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('getCallLimit', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_call_limit', args)
}

/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getEnabled(actionName: string,
                                 browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                 api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getEnabled: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('getEnabled', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_enabled', args)
}

/**
 * Get a unique ID for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getId(actionName: string,
                            browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                            api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getId: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('getId', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_id', args)
}

/**
 * Get all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function nextActions(actionName: string,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: nextActions: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('nextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('next_sequences', args)
}

/**
 * Return the number of active next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function numberActiveNextActions(actionName: string,
                                              browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: numberActiveNextActions: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('numberActiveNextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('number_active_next_sequences', args)
}

/**
 * Return the number of possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function numberNextActions(actionName: string,
                                        browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                        api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: numberNextActions: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('numberNextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('number_next_sequences', args)
}

/**
 * Remove all actions in the next action list
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function removeAllNext(actionName: string,
                                    browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                    api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: removeAllNext: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('removeAllNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_all_next', args)
}

/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function removeFromCallers(actionName: string,
                                        browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                        api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: removeFromCallers: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments('removeFromCallers', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_from_callers', args)
}

/**
 * Remove an existing next action from the list of next actions
 * @param actionName - name of the action
 * @param nextAction - name of the action to remove
 * @param browser
 * @param api
 */
export async function removeNext(actionName: string, nextAction: string,
                                 browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                 api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: removeNext: actionName, nextAction', actionName, nextAction);
    let argumentsDescription = {"actionName": "string", "nextAction": "string"}
    validateArguments('removeNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_next', args)
}

/**
 * Set the maximum number of calls for this action
 * @param actionName - name of the action
 * @param limit - the call limit to set
 * @param browser
 * @param api
 */
export async function setCallLimit(actionName: string, limit: number,
                                   browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                   api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: setCallLimit: actionName, limit', actionName, limit);
    let argumentsDescription = {"actionName": "string", "limit": "number"}
    validateArguments('setCallLimit', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_call_limit', args)
}

/**
 * Vitaq command to enable/disable actions
 * @param actionName - name of the action to enable/disable
 * @param enabled - true sets enabled, false sets disabled
 * @param browser
 * @param api
 */
export async function setEnabled(actionName: string, enabled: boolean,
                                 browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                 api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: setEnabled: actionName, enabled', actionName, enabled);
    let argumentsDescription = {"actionName": "string", "enabled": "boolean"}
    validateArguments('setEnabled', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_enabled', args)
}

/**
 * set or clear the exhaustive flag
 * @param actionName - name of the action
 * @param exhaustive - true sets exhaustive, false clears exhaustive
 * @param browser
 * @param api
 */
export async function setExhaustive(actionName: string, exhaustive: boolean,
                                    browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                    api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: setExhaustive: actionName, exhaustive', actionName, exhaustive);
    let argumentsDescription = {"actionName": "string", "exhaustive": "boolean"}
    validateArguments('setExhaustive', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_exhaustive', args)
}

/**
 * Set the maximum allowable recursive depth
 * @param actionName - name of the action
 * @param depth - Maximum allowable recursive depth
 * @param browser
 * @param api
 */
export async function setMaxActionDepth(actionName: string, depth: number = 1000,
                                        browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                        api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: setMaxActionDepth: actionName, depth', actionName, depth);
    let argumentsDescription = {"actionName": "string", "depth": "number"}
    validateArguments('setMaxActionDepth', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_max_sequence_depth', args)
}

// =============================================================================
// Data Methods
// =============================================================================

/**
 * Specify a list to add to the existing list in a list variable
 * @param variableName - name of the variable
 * @param list - The list to add to the existing list
 * @param browser
 * @param api
 */
export async function allowList(variableName: string, list: [],
                                browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowList: variableName, list', variableName, list);
    let argumentsDescription = {"variableName": "string", "list": "array"}
    validateArguments('allowList', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_list', args)
}

/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
export async function allowOnlyList(variableName: string, list: [],
                                    browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                    api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowOnlyList: variableName, list', variableName, list);
    let argumentsDescription = {"variableName": "string", "list": "array"}
    validateArguments('allowOnlyList', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_list', args)
}

/**
 * Allow ONLY the defined range to be the allowable range for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export async function allowOnlyRange(variableName: string, low: number, high: number,
                                     browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                     api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowOnlyRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = {"variableName": "string", "low": "number", "high": "number"}
    validateArguments('allowOnlyRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_range', args)
}

/**
 * Allow ONLY the defined value to be the allowable value for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export async function allowOnlyValue(variableName: string, value: number,
                                     browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                     api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowOnlyValue: variableName, value', variableName, value);
    let argumentsDescription = {"variableName": "string", "value": "number"}
    validateArguments('allowOnlyValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_value', args)
}

/**
 * Allow ONLY the passed list of values as the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export async function allowOnlyValues(variableName: string, valueList: [],
                                      browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                      api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowOnlyValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = {"variableName": "string", "valueList": "array"}
    validateArguments('allowOnlyValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length]
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index])
    }
    // @ts-ignore
    return await api.runCommandCaller('allow_only_values', vtqArguments)
}

/**
 * Add the defined range to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export async function allowRange(variableName: string, low: number, high: number,
                                 browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                 api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = {"variableName": "string", "low": "number", "high": "number"}
    validateArguments('allowRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_range', args)
}

/**
 * Add the defined value to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export async function allowValue(variableName: string, value: number,
                                 browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                 api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowValue: variableName, value', variableName, value);
    let argumentsDescription = {"variableName": "string", "value": "number"}
    validateArguments('allowValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_value', args)
}

/**
 * Add the passed list of values to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export async function allowValues(variableName: string, valueList: [],
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: allowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = {"variableName": "string", "valueList": "array"}
    validateArguments('allowValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length]
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index])
    }
    // @ts-ignore
    return await api.runCommandCaller('allow_values', vtqArguments)
}

/**
 * Remove the defined range from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export async function disallowRange(variableName: string, low: number, high: number,
                                    browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                    api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: disallowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = {"variableName": "string", "low": "number", "high": "number"}
    validateArguments('disallowRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('disallow_range', args)
}

/**
 * Remove the defined value from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be removed
 * @param browser
 * @param api
 */
export async function disallowValue(variableName: string, value: number,
                                    browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                    api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: disallowValue: variableName, value', variableName, value);
    let argumentsDescription = {"variableName": "string", "value": "number"}
    validateArguments('disallowValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('disallow_value', args)
}

/**
 * Remove the passed list of values from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be removed
 * @param browser
 * @param api
 */
export async function disallowValues(variableName: string, valueList: [],
                                     browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                     api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: disallowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = {"variableName": "string", "valueList": "array"}
    validateArguments('disallowValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length]
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index])
    }
    // @ts-ignore
    return await api.runCommandCaller('disallow_values', vtqArguments)
}

/**
 * Specify that values should not be repeated
 * @param variableName - name of the variable
 * @param value - true prevents values from being repeated
 * @param browser
 * @param api
 */
export async function doNotRepeat(variableName: string, value: boolean,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: doNotRepeat: variableName, value', variableName, value);
    let argumentsDescription = {"variableName": "string", "value": "boolean"}
    validateArguments('doNotRepeat', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('do_not_repeat', args)
}

/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function gen(variableName: string,
                          browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                          api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: gen: variableName', variableName);
    let argumentsDescription = {"variableName": "string"}
    validateArguments('gen', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('gen', args)
}

/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function getDoNotRepeat(variableName: string,
                                     browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                     api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getDoNotRepeat: variableName', variableName);
    let argumentsDescription = {"variableName": "string"}
    validateArguments('getDoNotRepeat', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_do_not_repeat', args)
}

/**
 * Get the starting seed being used
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function getSeed(variableName: string,
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getSeed: variableName', variableName);
    let argumentsDescription = {"variableName": "string"}
    validateArguments('getSeed', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_seed', args)
}

/**
 * Get the current value of the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function getValue(variableName: string,
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getValue: variableName', variableName);
    let argumentsDescription = {"variableName": "string"}
    validateArguments('getValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_value', args)
}

/**
 * Remove all constraints on values
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function resetRanges(variableName: string,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: resetRanges: variableName', variableName);
    let argumentsDescription = {"variableName": "string"}
    validateArguments('resetRanges', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('reset_ranges', args)
}

/**
 * Set the seed to use
 * @param variableName - name of the variable
 * @param seed - Seed to use
 * @param browser
 * @param api
 */
export async function setSeed(variableName: string, seed: number,
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: setSeed: variableName, seed', variableName, seed);
    let argumentsDescription = {"variableName": "string", "seed": "number"}
    validateArguments('setSeed', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_seed', args)
}

/**
 * Manually set a value for a variable
 * @param variableName - name of the variable
 * @param value - value to set
 * @param browser
 * @param api
 */
export async function setValue(variableName: string, value: number,
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: setValue: variableName, value', variableName, value);
    let argumentsDescription = {"variableName": "string", "value": "number"}
    validateArguments('setValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_value', args)
}

