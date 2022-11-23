//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import { validateArguments } from "./arguments.js";
// import logger from '@wdio/logger'
import logger from '@wdio/logger';
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
//                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
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
//                                  browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zQXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZnVuY3Rpb25zQXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZ0ZBQWdGO0FBQ2hGLGlDQUFpQztBQUNqQyxnRkFBZ0Y7QUFDaEYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFPakQsb0NBQW9DO0FBQ3BDLE9BQU8sTUFBTSxNQUFNLGNBQWMsQ0FBQztBQUNsQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUcxQzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxLQUFLLENBQUMsRUFBVSxFQUNWLE9BQW1FO0lBQzNGLElBQUksSUFBSSxHQUFXLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQixHQUFHLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsR0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyRCxJQUFJLG9CQUFvQixHQUFHLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFBO0lBQzNDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxhQUFhO0lBQ2IsT0FBTyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2hFLENBQUM7QUFFRCxnRkFBZ0Y7QUFDaEYsd0JBQXdCO0FBQ3hCLGdGQUFnRjtBQUNoRjs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsV0FBVyxDQUFDLFlBQW9CLEVBQzFCLE9BQW1FLEVBQ25FLEdBQWU7SUFDdkMsSUFBSSxJQUFJLEdBQVcsS0FBSyxDQUFD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