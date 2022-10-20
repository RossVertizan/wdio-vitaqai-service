//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import { validateArguments } from "./arguments";
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('wdio-vitaqai-service');
/**
 * Provide a simple sleep command
 * @param ms
 * @param browser
 */
export function sleep(ms, browser) {
    let args = Array.from(arguments);
    args.splice(-1, 1);
    log.debug("sleep: Sleeping for %s seconds", ms / 1000);
    let argumentsDescription = { "ms": "number" };
    validateArguments('sleep', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => new Promise(resolve => setTimeout(resolve, ms)));
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
export function requestData(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("requestData: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    validateArguments('requestData', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.requestDataCaller(variableName));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get Vitaq to record coverage for the variables in the array
 * @param variablesArray - array of variables to record coverage for
 * @param browser
 * @param api
 */
export function recordCoverage(variablesArray, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("recordCoverage: variablesArray ", variablesArray);
    let argumentsDescription = { "variablesArray": "array" };
    validateArguments('recordCoverage', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.recordCoverageCaller(variablesArray));
}
/**
 * Send data to Vitaq and record it on the named variable
 * @param variableName - name of the variable
 * @param value - value to store
 * @param browser
 * @param api
 */
export function sendDataToVitaq(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("sendDataToVitaq: variableName value", variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    validateArguments('sendDataToVitaq', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.sendDataToVitaqCaller(variableName, value));
}
/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
export function readDataFromVitaq(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("readDataFromVitaq: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    validateArguments('readDataFromVitaq', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.readDataFromVitaqCaller(variableName));
    log.info(`   -> ${result}`);
    return result;
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
export function createVitaqLogEntry(message, format, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("createVitaqLogEntry: message format", message, format);
    let argumentsDescription = { "message": "string", "format?": "string" };
    validateArguments('createVitaqLogEntry', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.createVitaqLogEntryCaller(message, format));
}
// =============================================================================
// Action Methods
// =============================================================================
/**
 * Abort the action causing it to not select a next action
 */
export function abort(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('abort: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('abort', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('abort', args));
}
/**
 * Add an action that can be called after this one
 * @param actionName - name of the action
 * @param nextAction - name of the action that could be called next
 * @param weight - Weight for the selection of the next action
 * @param browser
 * @param api
 */
export function addNext(actionName, nextAction, weight = 1, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    let argumentsDescription = { "actionName": "string", "nextAction": "string", "weight": "number" };
    args = validateArguments('addNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('add_next', args));
}
/**
 * Set the call_count back to zero
 * @param actionName - name of the action
 * @param tree - clear call counts on all next actions
 * @param browser
 * @param api
 */
export function clearCallCount(actionName, tree, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('clearCallCount: actionName, tree', actionName, tree);
    let argumentsDescription = { "actionName": "string", "tree?": "boolean" };
    args = validateArguments('clearCallCount', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('clear_call_count', args));
}
/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function displayNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('displayNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('displayNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('display_next_sequences', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the current call count for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getCallCount(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallCount: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getCallCount', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_call_count', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the maximum number of times this action can be called
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getCallLimit(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallLimit: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getCallLimit', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_call_limit', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getEnabled(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getEnabled: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getEnabled', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_enabled', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Query if the action is exhaustive
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
// export function getExhaustive(actionName: string,
//                            browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
//                            api: VitaqAiApi) {
//     let args: any [] = Array.from(arguments);
//     args.splice(-2, 2);
//     log.debug('getExhaustive: actionName', actionName);
//     let argumentsDescription = {"actionName": "string"}
//     args = validateArguments('getExhaustive', argumentsDescription, args);
//     // @ts-ignore
//     let result = browser.call(() =>
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
//                            browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
//                            api: VitaqAiApi) {
//     let args: any [] = Array.from(arguments);
//     args.splice(-2, 2);
//     log.debug('getMaxActionDepth: actionName', actionName);
//     let argumentsDescription = {"actionName": "string"}
//     args = validateArguments('getMaxActionDepth', argumentsDescription, args);
//     // @ts-ignore
//     let result = browser.call(() =>
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
export function getId(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getId: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getId', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_id', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the action run previously
 * @param actionName - name of the action
 * @param steps - how many steps to go back
 * @param browser
 * @param api
 */
export function getPrevious(actionName, steps, browser, api) {
    let result;
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getPrevious: actionName, steps', actionName, steps);
    let argumentsDescription = { "actionName": "string", "steps?": "number" };
    args = validateArguments('getPrevious', argumentsDescription, args);
    // @ts-ignore
    result = browser.call(() => api.runCommandCaller('get_previous', args));
    result = JSON.parse(result).name;
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function nextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('nextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('nextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('next_sequences', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Return the number of active next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function numberActiveNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberActiveNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('numberActiveNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('number_active_next_sequences', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Return the number of possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function numberNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('numberNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('number_next_sequences', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Remove all actions in the next action list
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function removeAllNext(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeAllNext: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('removeAllNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('remove_all_next', args));
}
/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function removeFromCallers(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeFromCallers: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('removeFromCallers', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('remove_from_callers', args));
}
/**
 * Remove an existing next action from the list of next actions
 * @param actionName - name of the action
 * @param nextAction - name of the action to remove
 * @param browser
 * @param api
 */
export function removeNext(actionName, nextAction, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeNext: actionName, nextAction', actionName, nextAction);
    let argumentsDescription = { "actionName": "string", "nextAction": "string" };
    args = validateArguments('removeNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('remove_next', args));
}
/**
 * Set the maximum number of calls for this action
 * @param actionName - name of the action
 * @param limit - the call limit to set
 * @param browser
 * @param api
 */
export function setCallLimit(actionName, limit, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setCallLimit: actionName, limit', actionName, limit);
    let argumentsDescription = { "actionName": "string", "limit": "number" };
    args = validateArguments('setCallLimit', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_call_limit', args));
}
/**
 * Vitaq command to enable/disable actions
 * @param actionName - name of the action to enable/disable
 * @param enabled - true sets enabled, false sets disabled
 * @param browser
 * @param api
 */
export function setEnabled(actionName, enabled, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setEnabled: actionName, enabled', actionName, enabled);
    let argumentsDescription = { "actionName": "string", "enabled": "boolean" };
    args = validateArguments('setEnabled', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_enabled', args));
}
/**
 * set or clear the exhaustive flag
 * @param actionName - name of the action
 * @param exhaustive - true sets exhaustive, false clears exhaustive
 * @param browser
 * @param api
 */
export function setExhaustive(actionName, exhaustive, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setExhaustive: actionName, exhaustive', actionName, exhaustive);
    let argumentsDescription = { "actionName": "string", "exhaustive": "boolean" };
    args = validateArguments('setExhaustive', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_exhaustive', args));
}
/**
 * Set the maximum allowable recursive depth
 * @param actionName - name of the action
 * @param depth - Maximum allowable recursive depth
 * @param browser
 * @param api
 */
export function setMaxActionDepth(actionName, depth = 1000, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setMaxActionDepth: actionName, depth', actionName, depth);
    let argumentsDescription = { "actionName": "string", "depth": "number" };
    args = validateArguments('setMaxActionDepth', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_max_sequence_depth', args));
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
export function allowList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = validateArguments('allowList', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_list', args));
}
/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
export function allowOnlyList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = validateArguments('allowOnlyList', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_only_list', args));
}
/**
 * Allow ONLY the defined range to be the allowable range for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export function allowOnlyRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = validateArguments('allowOnlyRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_only_range', args));
}
/**
 * Allow ONLY the defined value to be the allowable value for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export function allowOnlyValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = validateArguments('allowOnlyValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_only_value', args));
}
/**
 * Allow ONLY the passed list of values as the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export function allowOnlyValues(variableName, valueList, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = validateArguments('allowOnlyValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length];
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index]);
    }
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_only_values', vtqArguments));
}
/**
 * Add the defined range to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export function allowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = validateArguments('allowRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_range', args));
}
/**
 * Add the defined value to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export function allowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = validateArguments('allowValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_value', args));
}
/**
 * Add the passed list of values to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export function allowValues(variableName, valueList, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = validateArguments('allowValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length];
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index]);
    }
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_values', vtqArguments));
}
/**
 * Remove the defined range from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export function disallowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = validateArguments('disallowRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('disallow_range', args));
}
/**
 * Remove the defined value from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be removed
 * @param browser
 * @param api
 */
export function disallowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = validateArguments('disallowValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('disallow_value', args));
}
/**
 * Remove the passed list of values from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be removed
 * @param browser
 * @param api
 */
export function disallowValues(variableName, valueList, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = validateArguments('disallowValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length];
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index]);
    }
    // @ts-ignore
    browser.call(() => api.runCommandCaller('disallow_values', vtqArguments));
}
/**
 * Specify that values should not be repeated
 * @param variableName - name of the variable
 * @param value - true prevents values from being repeated
 * @param browser
 * @param api
 */
export function doNotRepeat(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('doNotRepeat: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "boolean" };
    args = validateArguments('doNotRepeat', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('do_not_repeat', args));
}
/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function gen(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('gen: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('gen', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('gen', args));
}
/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function getDoNotRepeat(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getDoNotRepeat: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('getDoNotRepeat', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_do_not_repeat', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the starting seed being used
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function getSeed(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getSeed: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('getSeed', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_seed', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the current value of the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function getValue(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getValue: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('getValue', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_value', args));
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Remove all constraints on values
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export function resetRanges(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('resetRanges: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('resetRanges', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('reset_ranges', args));
}
/**
 * Set the seed to use
 * @param variableName - name of the variable
 * @param seed - Seed to use
 * @param browser
 * @param api
 */
export function setSeed(variableName, seed, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setSeed: variableName, seed', variableName, seed);
    let argumentsDescription = { "variableName": "string", "seed": "number" };
    args = validateArguments('setSeed', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_seed', args));
}
/**
 * Manually set a value for a variable
 * @param variableName - name of the variable
 * @param value - value to set
 * @param browser
 * @param api
 */
export function setValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    args = validateArguments('setValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_value', args));
}
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zU3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mdW5jdGlvbnNTeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGO0FBQ2hGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQU85QyxvQ0FBb0M7QUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUMvQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUUxQzs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLEtBQUssQ0FBQyxFQUFVLEVBQ1YsT0FBdUQ7SUFDekUsSUFBSSxJQUFJLEdBQVcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25CLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsRUFBRSxHQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JELElBQUksb0JBQW9CLEdBQUcsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUE7SUFDM0MsaUJBQWlCLENBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZELGFBQWE7SUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUNkLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUNsRCxDQUFDO0FBQ04sQ0FBQztBQUVELGdGQUFnRjtBQUNoRix3QkFBd0I7QUFDeEIsZ0ZBQWdGO0FBQ2hGOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLFdBQVcsQ0FBQyxZQUFvQixFQUNwQixPQUF1RCxFQUN2RCxHQUFl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