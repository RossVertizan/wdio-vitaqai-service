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
export async function sleep(ms, browser) {
    let args = Array.from(arguments);
    args.splice(-1, 1);
    log.debug("sleep: Sleeping for %s seconds", ms / 1000);
    let argumentsDescription = { "ms": "number" };
    validateArguments('sleep', argumentsDescription, args);
    // @ts-ignore
    return await new Promise(resolve => setTimeout(resolve, ms));
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
export async function requestData(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("requestData: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    validateArguments('requestData', argumentsDescription, args);
    let result = await api.requestDataCaller(variableName);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get Vitaq to record coverage for the variables in the array
 * @param variablesArray - array of variables to record coverage for
 * @param browser
 * @param api
 */
export async function recordCoverage(variablesArray, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("recordCoverage: variablesArray ", variablesArray);
    let argumentsDescription = { "variablesArray": "array" };
    validateArguments('recordCoverage', argumentsDescription, args);
    return await api.recordCoverageCaller(variablesArray);
}
/**
 * Send data to Vitaq and record it on the named variable
 * @param variableName - name of the variable
 * @param value - value to store
 * @param browser
 * @param api
 */
export async function sendDataToVitaq(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("sendDataToVitaq: variableName value", variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    validateArguments('sendDataToVitaq', argumentsDescription, args);
    return await api.sendDataToVitaqCaller(variableName, value);
}
/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
export async function readDataFromVitaq(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("readDataFromVitaq: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    validateArguments('readDataFromVitaq', argumentsDescription, args);
    let result = await api.readDataFromVitaqCaller(variableName);
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
export async function createVitaqLogEntry(message, format = 'text', browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("createVitaqLogEntry: message format", message, format);
    let argumentsDescription = { "message": "string", "format?": "string" };
    validateArguments('createVitaqLogEntry', argumentsDescription, args);
    return await api.createVitaqLogEntryCaller(message, format);
}
// =============================================================================
// Action Methods
// =============================================================================
/**
 * Abort the action causing it to not select a next action
 */
export async function abort(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('abort: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('abort', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('abort', args);
}
/**
 * Add an action that can be called after this one
 * @param actionName - name of the action
 * @param nextAction - name of the action that could be called next
 * @param weight - Weight for the selection of the next action
 * @param browser
 * @param api
 */
export async function addNext(actionName, nextAction, weight = 1, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    let argumentsDescription = { "actionName": "string", "nextAction": "string", "weight": "number" };
    args = validateArguments('addNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('add_next', args);
}
/**
 * Set the call_count back to zero
 * @param actionName - name of the action
 * @param tree - clear call counts on all next actions
 * @param browser
 * @param api
 */
export async function clearCallCount(actionName, tree, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('clearCallCount: actionName, tree', actionName, tree);
    let argumentsDescription = { "actionName": "string", "tree?": "boolean" };
    args = validateArguments('clearCallCount', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('clear_call_count', args);
}
/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function displayNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('displayNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = args = validateArguments('displayNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('display_next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the current call count for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getCallCount(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallCount: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getCallCount', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_call_count', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the maximum number of times this action can be called
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getCallLimit(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallLimit: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getCallLimit', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_call_limit', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getEnabled(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getEnabled: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getEnabled', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_enabled', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Query if the action is exhaustive
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
// export async function getExhaustive(actionName: string,
//                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
//                                  api: VitaqAiApi) {
//     let args: any [] = Array.from(arguments);
//     args.splice(-2, 2);
//     log.debug('getExhaustive: actionName', actionName);
//     let argumentsDescription = {"actionName": "string"}
//     args = validateArguments('getExhaustive', argumentsDescription, args);
//     // @ts-ignore
//     let result = await api.runCommandCaller('get_exhaustive', args)
//     log.info(`   -> ${result}`)
//     return result
// }
/**
 * Query the max sequence depth
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
// export async function getMaxActionDepth(actionName: string,
//                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
//                                  api: VitaqAiApi) {
//     let args: any [] = Array.from(arguments);
//     args.splice(-2, 2);
//     log.debug('getMaxActionDepth: actionName', actionName);
//     let argumentsDescription = {"actionName": "string"}
//     args = validateArguments('getMaxActionDepth', argumentsDescription, args);
//     // @ts-ignore
//     let result = await api.runCommandCaller('get_max_sequence_depth', args)
//     log.info(`   -> ${result}`)
//     return result
// }
/**
 * Get a unique ID for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function getId(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getId: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('getId', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_id', args);
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
export async function getPrevious(actionName, steps, browser, api) {
    let result;
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getPrevious: actionName, steps', actionName, steps);
    let argumentsDescription = { "actionName": "string", "steps?": "number" };
    args = validateArguments('getPrevious', argumentsDescription, args);
    // @ts-ignore
    result = await api.runCommandCaller('get_previous', args);
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
export async function nextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('nextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('nextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Return the number of active next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function numberActiveNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberActiveNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('numberActiveNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('number_active_next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Return the number of possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function numberNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('numberNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('number_next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Remove all actions in the next action list
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function removeAllNext(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeAllNext: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('removeAllNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_all_next', args);
}
/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export async function removeFromCallers(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeFromCallers: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = validateArguments('removeFromCallers', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_from_callers', args);
}
/**
 * Remove an existing next action from the list of next actions
 * @param actionName - name of the action
 * @param nextAction - name of the action to remove
 * @param browser
 * @param api
 */
export async function removeNext(actionName, nextAction, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeNext: actionName, nextAction', actionName, nextAction);
    let argumentsDescription = { "actionName": "string", "nextAction": "string" };
    args = validateArguments('removeNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_next', args);
}
/**
 * Set the maximum number of calls for this action
 * @param actionName - name of the action
 * @param limit - the call limit to set
 * @param browser
 * @param api
 */
export async function setCallLimit(actionName, limit, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setCallLimit: actionName, limit', actionName, limit);
    let argumentsDescription = { "actionName": "string", "limit": "number" };
    args = validateArguments('setCallLimit', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_call_limit', args);
}
/**
 * Vitaq command to enable/disable actions
 * @param actionName - name of the action to enable/disable
 * @param enabled - true sets enabled, false sets disabled
 * @param browser
 * @param api
 */
export async function setEnabled(actionName, enabled, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setEnabled: actionName, enabled', actionName, enabled);
    let argumentsDescription = { "actionName": "string", "enabled": "boolean" };
    args = validateArguments('setEnabled', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_enabled', args);
}
/**
 * set or clear the exhaustive flag
 * @param actionName - name of the action
 * @param exhaustive - true sets exhaustive, false clears exhaustive
 * @param browser
 * @param api
 */
export async function setExhaustive(actionName, exhaustive, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setExhaustive: actionName, exhaustive', actionName, exhaustive);
    let argumentsDescription = { "actionName": "string", "exhaustive": "boolean" };
    args = validateArguments('setExhaustive', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_exhaustive', args);
}
/**
 * Set the maximum allowable recursive depth
 * @param actionName - name of the action
 * @param depth - Maximum allowable recursive depth
 * @param browser
 * @param api
 */
export async function setMaxActionDepth(actionName, depth = 1000, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setMaxActionDepth: actionName, depth', actionName, depth);
    let argumentsDescription = { "actionName": "string", "depth": "number" };
    args = validateArguments('setMaxActionDepth', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_max_sequence_depth', args);
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
export async function allowList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = validateArguments('allowList', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_list', args);
}
/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
export async function allowOnlyList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = validateArguments('allowOnlyList', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_list', args);
}
/**
 * Allow ONLY the defined range to be the allowable range for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export async function allowOnlyRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = validateArguments('allowOnlyRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_range', args);
}
/**
 * Allow ONLY the defined value to be the allowable value for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export async function allowOnlyValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = validateArguments('allowOnlyValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_value', args);
}
/**
 * Allow ONLY the passed list of values as the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export async function allowOnlyValues(variableName, valueList, browser, api) {
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
    return await api.runCommandCaller('allow_only_values', vtqArguments);
}
/**
 * Add the defined range to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export async function allowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = validateArguments('allowRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_range', args);
}
/**
 * Add the defined value to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export async function allowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = validateArguments('allowValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_value', args);
}
/**
 * Add the passed list of values to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export async function allowValues(variableName, valueList, browser, api) {
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
    return await api.runCommandCaller('allow_values', vtqArguments);
}
/**
 * Remove the defined range from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export async function disallowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = validateArguments('disallowRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('disallow_range', args);
}
/**
 * Remove the defined value from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be removed
 * @param browser
 * @param api
 */
export async function disallowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = validateArguments('disallowValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('disallow_value', args);
}
/**
 * Remove the passed list of values from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be removed
 * @param browser
 * @param api
 */
export async function disallowValues(variableName, valueList, browser, api) {
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
    return await api.runCommandCaller('disallow_values', vtqArguments);
}
/**
 * Specify that values should not be repeated
 * @param variableName - name of the variable
 * @param value - true prevents values from being repeated
 * @param browser
 * @param api
 */
export async function doNotRepeat(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('doNotRepeat: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "boolean" };
    args = validateArguments('doNotRepeat', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('do_not_repeat', args);
}
/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function gen(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('gen: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('gen', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('gen', args);
}
/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function getDoNotRepeat(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getDoNotRepeat: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('getDoNotRepeat', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_do_not_repeat', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the starting seed being used
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function getSeed(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getSeed: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('getSeed', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_seed', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Get the current value of the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function getValue(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getValue: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('getValue', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_value', args);
    log.info(`   -> ${result}`);
    return result;
}
/**
 * Remove all constraints on values
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export async function resetRanges(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('resetRanges: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = validateArguments('resetRanges', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('reset_ranges', args);
}
/**
 * Set the seed to use
 * @param variableName - name of the variable
 * @param seed - Seed to use
 * @param browser
 * @param api
 */
export async function setSeed(variableName, seed, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setSeed: variableName, seed', variableName, seed);
    let argumentsDescription = { "variableName": "string", "seed": "number" };
    args = validateArguments('setSeed', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_seed', args);
}
/**
 * Manually set a value for a variable
 * @param variableName - name of the variable
 * @param value - value to set
 * @param browser
 * @param api
 */
export async function setValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    args = validateArguments('setValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_value', args);
}
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zQXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZnVuY3Rpb25zQXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZ0ZBQWdGO0FBQ2hGLGlDQUFpQztBQUNqQyxnRkFBZ0Y7QUFDaEYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBTzlDLG9DQUFvQztBQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBRzFDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLEtBQUssQ0FBQyxFQUFVLEVBQ1YsT0FBdUQ7SUFDL0UsSUFBSSxJQUFJLEdBQVcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25CLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsRUFBRSxHQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JELElBQUksb0JBQW9CLEdBQUcsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUE7SUFDM0MsaUJBQWlCLENBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZELGFBQWE7SUFDYixPQUFPLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDaEUsQ0FBQztBQUVELGdGQUFnRjtBQUNoRix3QkFBd0I7QUFDeEIsZ0ZBQWdGO0FBQ2hGOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxXQUFXLENBQUMsWUFBb0IsRUFDMUIsT0FBdUQsRUFDdkQsR0FBZTtJQUN2QyxJ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