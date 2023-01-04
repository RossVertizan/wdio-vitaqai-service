/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prefer-rest-params */
//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import {validateArguments} from "./arguments.js";

// Type import
// @ts-ignore
import VitaqAiApi from 'vitaqai-api'
import type { Browser, MultiRemoteBrowser } from 'webdriverio'

// import logger from '@wdio/logger'
import logger from '@wdio/logger';
const log = logger('wdio-vitaqai-service')

/**
 * Provide a simple sleep command
 * @param ms
 * @param browser
 */
export function sleep(ms: number,
                      browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined) {
    let args: any [] = Array.from(arguments);
    args.splice(-1, 1);
    log.debug("sleep: Sleeping for %s seconds", ms/1000);
    const argumentsDescription = {"ms": "number"}
    args = validateArguments('sleep', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        new Promise(resolve => setTimeout(resolve, ms))
    );
}

// =============================================================================
// VITAQ CONTROL METHODS
// =============================================================================
/**
 * Get Vitaq to generate a new value for the variable and then get it
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function requestData(variableName: string,
                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                            api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("requestData: variableName ", variableName);
    const argumentsDescription = {"variableName": "string"}
    args = validateArguments('requestData', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.requestDataCaller(variableName)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Get Vitaq to record coverage for the variables in the array
 * @param variablesArray - array of variables to record coverage for
 * @param browser
 * @param api
 */
export function recordCoverage(variablesArray: [],
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("recordCoverage: variablesArray ", variablesArray);
    const argumentsDescription = {"variablesArray": "array"}
    args = validateArguments('recordCoverage', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.recordCoverageCaller(variablesArray)
    )
}

/**
 * Send data to Vitaq and record it on the named variable
 * @param variableName - name of the variable
 * @param value - value to store
 * @param browser
 * @param api
 */
export function sendDataToVitaq(variableName: string, value: any,
                                browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("sendDataToVitaq: variableName value", variableName, value);
    const argumentsDescription = {"variableName": "string", "value": "any"}
    args = validateArguments('sendDataToVitaq', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.sendDataToVitaqCaller(variableName, value)
    )
}

/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
export function readDataFromVitaq(variableName: string,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("readDataFromVitaq: variableName ", variableName);
    const argumentsDescription = {"variableName": "string"}
    args = validateArguments('readDataFromVitaq', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.readDataFromVitaqCaller(variableName)
    )
    log.info(`   -> ${result}`)
    return result
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
// eslint-disable-next-line @typescript-eslint/ban-types
export function createVitaqLogEntry(message: string | {}, format: string,
                                    browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                    api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("createVitaqLogEntry: message format", message, format);
    const argumentsDescription = {"message": "string", "format?": "string"}
    args = validateArguments('createVitaqLogEntry', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.createVitaqLogEntryCaller(message, format)
    )
}

// =============================================================================
// Action Methods
// =============================================================================

/**
 * Abort the action causing it to not select a next action
 */
export function abort(actionName: string,
                      browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                      api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('abort: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('abort', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('abort', args)
    )
}

/**
 * Add an action that can be called after this one
 * @param actionName - name of the action
 * @param nextAction - name of the action that could be called next
 * @param weight - Weight for the selection of the next action
 * @param browser
 * @param api
 */
export function addNext(actionName: string, nextAction: string, weight: number,
                        browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                        api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    const argumentsDescription = {"actionName": "string", "nextAction": "string", "weight": "number"}
    args = validateArguments('addNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('add_next', args)
    )
}

/**
 * Set the call_count back to zero
 * @param actionName - name of the action
 * @param tree - clear call counts on all next actions
 * @param browser
 * @param api
 */
export function clearCallCount(actionName: string, tree: boolean,
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('clearCallCount: actionName, tree', actionName, tree);
    const argumentsDescription = {"actionName": "string", "tree?": "boolean"}
    args = validateArguments('clearCallCount', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('clear_call_count', args)
    )
}

/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function displayNextActions(actionName: string,
                                   browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                   api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('displayNextActions: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('displayNextActions', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('display_next_sequences', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Get the current call count for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getCallCount(actionName: string,
                             browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                             api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallCount: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('getCallCount', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('get_call_count', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Get the maximum number of times this action can be called
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getCallLimit(actionName: string,
                             browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                             api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallLimit: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('getCallLimit', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('get_call_limit', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getEnabled(actionName: string,
                           browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                           api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getEnabled: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('getEnabled', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('get_enabled', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Query if the action is exhaustive
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
// export function getExhaustive(actionName: string,
//                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
//                            api: VitaqAiApi) {
//     let args: any [] = Array.from(arguments);
//     args.splice(-2, 2);
//     log.debug('getExhaustive: actionName', actionName);
//     const argumentsDescription = {"actionName": "string"}
//     args = validateArguments('getExhaustive', argumentsDescription, args);
//     // @ts-ignore
//     const result = browser.call(() =>
//         api.runCommandCaller('get_exhaustive', args)
//     )
//     log.info(`   -> ${result}`)
//     return result
// }

/**
 * Query the max sequence depth
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
// export function getMaxActionDepth(actionName: string,
//                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
//                            api: VitaqAiApi) {
//     let args: any [] = Array.from(arguments);
//     args.splice(-2, 2);
//     log.debug('getMaxActionDepth: actionName', actionName);
//     const argumentsDescription = {"actionName": "string"}
//     args = validateArguments('getMaxActionDepth', argumentsDescription, args);
//     // @ts-ignore
//     const result = browser.call(() =>
//         api.runCommandCaller('get_max_sequence_depth', args)
//     )
//     log.info(`   -> ${result}`)
//     return result
// }

/**
 * Get a unique ID for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getId(actionName: string,
                      browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                      api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getId: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('getId', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('get_id', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Get the action run previously
 * @param actionName - name of the action
 * @param steps - how many steps to go back
 * @param browser
 * @param api
 */
export function getPrevious(actionName: string, steps: number,
                      browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                      api: VitaqAiApi) {
    let result: string;
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getPrevious: actionName, steps', actionName, steps);
    const argumentsDescription = {"actionName": "string", "steps?": "number"}
    args = validateArguments('getPrevious', argumentsDescription, args);
    // @ts-ignore
    result = browser.call(() =>
        api.runCommandCaller('get_previous', args)
    )
    result = JSON.parse(result).name
    log.info(`   -> ${result}`)
    return result
}

/**
 * Get all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function nextActions(actionName: string,
                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                            api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('nextActions: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('nextActions', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('next_sequences', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Return the number of active next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function numberActiveNextActions(actionName: string,
                                        browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                        api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberActiveNextActions: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('numberActiveNextActions', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('number_active_next_sequences', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Return the number of possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function numberNextActions(actionName: string,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberNextActions: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('numberNextActions', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('number_next_sequences', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Remove all actions in the next action list
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function removeAllNext(actionName: string,
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeAllNext: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('removeAllNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('remove_all_next', args)
    )
}

/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function removeFromCallers(actionName: string,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeFromCallers: actionName', actionName);
    const argumentsDescription = {"actionName": "string"}
    args = validateArguments('removeFromCallers', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('remove_from_callers', args)
    )
}

/**
 * Remove an existing next action from the list of next actions
 * @param actionName - name of the action
 * @param nextAction - name of the action to remove
 * @param browser
 * @param api
 */
export function removeNext(actionName: string, nextAction: string,
                           browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                           api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeNext: actionName, nextAction', actionName, nextAction);
    const argumentsDescription = {"actionName": "string", "nextAction": "string"}
    args = validateArguments('removeNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('remove_next', args)
    )
}

/**
 * Set the maximum number of calls for this action
 * @param actionName - name of the action
 * @param limit - the call limit to set
 * @param browser
 * @param api
 */
export function setCallLimit(actionName: string, limit: number,
                             browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                             api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setCallLimit: actionName, limit', actionName, limit);
    const argumentsDescription = {"actionName": "string", "limit": "number"}
    args = validateArguments('setCallLimit', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('set_call_limit', args)
    )
}

/**
 * Vitaq command to enable/disable actions
 * @param actionName - name of the action to enable/disable
 * @param enabled - true sets enabled, false sets disabled
 * @param browser
 * @param api
 */
export function setEnabled(actionName: string, enabled: boolean,
                           browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                           api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setEnabled: actionName, enabled', actionName, enabled);
    const argumentsDescription = {"actionName": "string", "enabled": "boolean"}
    args = validateArguments('setEnabled', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('set_enabled', args)
    )
}

/**
 * set or clear the exhaustive flag
 * @param actionName - name of the action
 * @param exhaustive - true sets exhaustive, false clears exhaustive
 * @param browser
 * @param api
 */
export function setExhaustive(actionName: string, exhaustive: boolean,
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setExhaustive: actionName, exhaustive', actionName, exhaustive);
    const argumentsDescription = {"actionName": "string", "exhaustive": "boolean"}
    args = validateArguments('setExhaustive', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('set_exhaustive', args)
    )
}

/**
 * Set the maximum allowable recursive depth
 * @param actionName - name of the action
 * @param depth - Maximum allowable recursive depth
 * @param browser
 * @param api
 */
export function setMaxActionDepth(actionName: string, depth: number,
                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                  api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setMaxActionDepth: actionName, depth', actionName, depth);
    const argumentsDescription = {"actionName": "string", "depth": "number"}
    args = validateArguments('setMaxActionDepth', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('set_max_sequence_depth', args)
    )
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
// eslint-disable-next-line @typescript-eslint/ban-types
export function allowList(variableName: string, list: []|{},
                          browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                          api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowList: variableName, list', variableName, list);
    const argumentsDescription = {"variableName": "string", "list": "object"}
    args = validateArguments('allowList', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_list', args)
    )
}

/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function allowOnlyList(variableName: string, list: []|{},
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyList: variableName, list', variableName, list);
    const argumentsDescription = {"variableName": "string", "list": "object"}
    args = validateArguments('allowOnlyList', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_only_list', args)
    )
}

/**
 * Allow ONLY the defined range to be the allowable range for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export function allowOnlyRange(variableName: string, low: number, high: number,
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyRange: variableName, low, high', variableName, low, high);
    const argumentsDescription = {"variableName": "string", "low": "numberOrBool", "high": "numberOrBool"}
    args = validateArguments('allowOnlyRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_only_range', args)
    )
}

/**
 * Allow ONLY the defined value to be the allowable value for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export function allowOnlyValue(variableName: string, value: number,
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValue: variableName, value', variableName, value);
    const argumentsDescription = {"variableName": "string", "value": "numberOrBool"}
    args = validateArguments('allowOnlyValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_only_value', args)
    )
}

/**
 * Allow ONLY the passed list of values as the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export function allowOnlyValues(variableName: string, valueList: [],
                                browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                                api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValues: variableName, valueList', variableName, valueList);
    const argumentsDescription = {"variableName": "string", "valueList": "array"}
    args = validateArguments('allowOnlyValues', argumentsDescription, args);
    const vtqArguments = [variableName, valueList.length]
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index])
    }
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_only_values', vtqArguments)
    )
}

/**
 * Add the defined range to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export function allowRange(variableName: string, low: number, high: number,
                           browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                           api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowRange: variableName, low, high', variableName, low, high);
    const argumentsDescription = {"variableName": "string", "low": "numberOrBool", "high": "numberOrBool"}
    args = validateArguments('allowRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_range', args)
    )
}

/**
 * Add the defined value to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export function allowValue(variableName: string, value: number,
                           browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                           api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValue: variableName, value', variableName, value);
    const argumentsDescription = {"variableName": "string", "value": "numberOrBool"}
    args = validateArguments('allowValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_value', args)
    )
}

/**
 * Add the passed list of values to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export function allowValues(variableName: string, valueList: [],
                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                            api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValues: variableName, valueList', variableName, valueList);
    const argumentsDescription = {"variableName": "string", "valueList": "array"}
    args = validateArguments('allowValues', argumentsDescription, args);
    const vtqArguments = [variableName, valueList.length]
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index])
    }
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('allow_values', vtqArguments)
    )
}

/**
 * Remove the defined range from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export function disallowRange(variableName: string, low: number, high: number,
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowRange: variableName, low, high', variableName, low, high);
    const argumentsDescription = {"variableName": "string", "low": "numberOrBool", "high": "numberOrBool"}
    args = validateArguments('disallowRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('disallow_range', args)
    )
}

/**
 * Remove the defined value from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be removed
 * @param browser
 * @param api
 */
export function disallowValue(variableName: string, value: number,
                              browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                              api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValue: variableName, value', variableName, value);
    const argumentsDescription = {"variableName": "string", "value": "numberOrBool"}
    args = validateArguments('disallowValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('disallow_value', args)
    )
}

/**
 * Remove the passed list of values from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be removed
 * @param browser
 * @param api
 */
export function disallowValues(variableName: string, valueList: [],
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValues: variableName, valueList', variableName, valueList);
    const argumentsDescription = {"variableName": "string", "valueList": "array"}
    args = validateArguments('disallowValues', argumentsDescription, args);
    const vtqArguments = [variableName, valueList.length]
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index])
    }
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('disallow_values', vtqArguments)
    )
}

/**
 * Specify that values should not be repeated
 * @param variableName - name of the variable
 * @param value - true prevents values from being repeated
 * @param browser
 * @param api
 */
export function doNotRepeat(variableName: string, value: boolean,
                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                            api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('doNotRepeat: variableName, value', variableName, value);
    const argumentsDescription = {"variableName": "string", "value": "boolean"}
    args = validateArguments('doNotRepeat', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('do_not_repeat', args)
    )
}

/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function gen(variableName: string,
                    browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                    api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('gen: variableName', variableName);
    const argumentsDescription = {"variableName": "string"}
    args = validateArguments('gen', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('gen', args)
    )
}

/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function getDoNotRepeat(variableName: string,
                               browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                               api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getDoNotRepeat: variableName', variableName);
    const argumentsDescription = {"variableName": "string"}
    args = validateArguments('getDoNotRepeat', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('get_do_not_repeat', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Get the starting seed being used
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function getSeed(variableName: string,
                        browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                        api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getSeed: variableName', variableName);
    const argumentsDescription = {"variableName": "string"}
    args = validateArguments('getSeed', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('get_seed', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Get the current value of the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function getValue(variableName: string,
                         browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                         api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getValue: variableName', variableName);
    const argumentsDescription = {"variableName": "string"}
    args = validateArguments('getValue', argumentsDescription, args);
    // @ts-ignore
    const result = browser.call(() =>
        api.runCommandCaller('get_value', args)
    )
    log.info(`   -> ${result}`)
    return result
}

/**
 * Remove all constraints on values
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function resetRanges(variableName: string,
                            browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                            api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('resetRanges: variableName', variableName);
    const argumentsDescription = {"variableName": "string"}
    args = validateArguments('resetRanges', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('reset_ranges', args)
    )
}

/**
 * Set the seed to use
 * @param variableName - name of the variable
 * @param seed - Seed to use
 * @param browser
 * @param api
 */
export function setSeed(variableName: string, seed: number,
                        browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                        api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setSeed: variableName, seed', variableName, seed);
    const argumentsDescription = {"variableName": "string", "seed": "number"}
    args = validateArguments('setSeed', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('set_seed', args)
    )
}

/**
 * Manually set a value for a variable
 * @param variableName - name of the variable
 * @param value - value to set
 * @param browser
 * @param api
 */
export function setValue(variableName: string, value: any,
                         browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
                         api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setValue: variableName, value', variableName, value);
    const argumentsDescription = {"variableName": "string", "value": "any"}
    args = validateArguments('setValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() =>
        api.runCommandCaller('set_value', args)
    )
}

// =============================================================================
// END OF FILE
// =============================================================================
