"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValue = exports.setSeed = exports.resetRanges = exports.getValue = exports.getSeed = exports.getDoNotRepeat = exports.gen = exports.doNotRepeat = exports.disallowValues = exports.disallowValue = exports.disallowRange = exports.allowValues = exports.allowValue = exports.allowRange = exports.allowOnlyValues = exports.allowOnlyValue = exports.allowOnlyRange = exports.allowOnlyList = exports.allowList = exports.setMaxActionDepth = exports.setExhaustive = exports.setEnabled = exports.setCallLimit = exports.removeNext = exports.removeFromCallers = exports.removeAllNext = exports.numberNextActions = exports.numberActiveNextActions = exports.nextActions = exports.getPrevious = exports.getId = exports.getEnabled = exports.getCallLimit = exports.getCallCount = exports.displayNextActions = exports.clearCallCount = exports.addNext = exports.abort = exports.createVitaqLogEntry = exports.readDataFromVitaq = exports.sendDataToVitaq = exports.recordCoverage = exports.requestData = exports.sleep = void 0;
//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
const arguments_1 = require("./arguments");
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('wdio-vitaqai-service');
/**
 * Provide a simple sleep command
 * @param ms
 * @param browser
 */
async function sleep(ms, browser) {
    let args = Array.from(arguments);
    args.splice(-1, 1);
    log.debug("sleep: Sleeping for %s seconds", ms / 1000);
    let argumentsDescription = { "ms": "number" };
    (0, arguments_1.validateArguments)('sleep', argumentsDescription, args);
    // @ts-ignore
    return await new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
// =============================================================================
// VITAQ CONTROL METHODS
// =============================================================================
/**
 * Get Vitaq to generate a new value for the variable and then get it
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
async function requestData(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("requestData: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    (0, arguments_1.validateArguments)('requestData', argumentsDescription, args);
    let result = await api.requestDataCaller(variableName);
    log.info(`   -> ${result}`);
    return result;
}
exports.requestData = requestData;
/**
 * Get Vitaq to record coverage for the variables in the array
 * @param variablesArray - array of variables to record coverage for
 * @param browser
 * @param api
 */
async function recordCoverage(variablesArray, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("recordCoverage: variablesArray ", variablesArray);
    let argumentsDescription = { "variablesArray": "array" };
    (0, arguments_1.validateArguments)('recordCoverage', argumentsDescription, args);
    return await api.recordCoverageCaller(variablesArray);
}
exports.recordCoverage = recordCoverage;
/**
 * Send data to Vitaq and record it on the named variable
 * @param variableName - name of the variable
 * @param value - value to store
 * @param browser
 * @param api
 */
async function sendDataToVitaq(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("sendDataToVitaq: variableName value", variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    (0, arguments_1.validateArguments)('sendDataToVitaq', argumentsDescription, args);
    return await api.sendDataToVitaqCaller(variableName, value);
}
exports.sendDataToVitaq = sendDataToVitaq;
/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
async function readDataFromVitaq(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("readDataFromVitaq: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    (0, arguments_1.validateArguments)('readDataFromVitaq', argumentsDescription, args);
    let result = await api.readDataFromVitaqCaller(variableName);
    log.info(`   -> ${result}`);
    return result;
}
exports.readDataFromVitaq = readDataFromVitaq;
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
async function createVitaqLogEntry(message, format = 'text', browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("createVitaqLogEntry: message format", message, format);
    let argumentsDescription = { "message": "string", "format?": "string" };
    (0, arguments_1.validateArguments)('createVitaqLogEntry', argumentsDescription, args);
    return await api.createVitaqLogEntryCaller(message, format);
}
exports.createVitaqLogEntry = createVitaqLogEntry;
// =============================================================================
// Action Methods
// =============================================================================
/**
 * Abort the action causing it to not select a next action
 */
async function abort(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('abort: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('abort', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('abort', args);
}
exports.abort = abort;
/**
 * Add an action that can be called after this one
 * @param actionName - name of the action
 * @param nextAction - name of the action that could be called next
 * @param weight - Weight for the selection of the next action
 * @param browser
 * @param api
 */
async function addNext(actionName, nextAction, weight = 1, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    let argumentsDescription = { "actionName": "string", "nextAction": "string", "weight": "number" };
    args = (0, arguments_1.validateArguments)('addNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('add_next', args);
}
exports.addNext = addNext;
/**
 * Set the call_count back to zero
 * @param actionName - name of the action
 * @param tree - clear call counts on all next actions
 * @param browser
 * @param api
 */
async function clearCallCount(actionName, tree, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('clearCallCount: actionName, tree', actionName, tree);
    let argumentsDescription = { "actionName": "string", "tree?": "boolean" };
    args = (0, arguments_1.validateArguments)('clearCallCount', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('clear_call_count', args);
}
exports.clearCallCount = clearCallCount;
/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function displayNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('displayNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = args = (0, arguments_1.validateArguments)('displayNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('display_next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.displayNextActions = displayNextActions;
/**
 * Get the current call count for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function getCallCount(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallCount: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getCallCount', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_call_count', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.getCallCount = getCallCount;
/**
 * Get the maximum number of times this action can be called
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function getCallLimit(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallLimit: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getCallLimit', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_call_limit', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.getCallLimit = getCallLimit;
/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function getEnabled(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getEnabled: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getEnabled', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_enabled', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.getEnabled = getEnabled;
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
async function getId(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getId: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getId', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_id', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.getId = getId;
/**
 * Get the action run previously
 * @param actionName - name of the action
 * @param steps - how many steps to go back
 * @param browser
 * @param api
 */
async function getPrevious(actionName, steps, browser, api) {
    let result;
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getPrevious: actionName, steps', actionName, steps);
    let argumentsDescription = { "actionName": "string", "steps?": "number" };
    args = (0, arguments_1.validateArguments)('getPrevious', argumentsDescription, args);
    // @ts-ignore
    result = await api.runCommandCaller('get_previous', args);
    result = JSON.parse(result).name;
    log.info(`   -> ${result}`);
    return result;
}
exports.getPrevious = getPrevious;
/**
 * Get all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function nextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('nextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('nextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.nextActions = nextActions;
/**
 * Return the number of active next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function numberActiveNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberActiveNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('numberActiveNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('number_active_next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.numberActiveNextActions = numberActiveNextActions;
/**
 * Return the number of possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function numberNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('numberNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('number_next_sequences', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.numberNextActions = numberNextActions;
/**
 * Remove all actions in the next action list
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function removeAllNext(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeAllNext: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('removeAllNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_all_next', args);
}
exports.removeAllNext = removeAllNext;
/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function removeFromCallers(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeFromCallers: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('removeFromCallers', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_from_callers', args);
}
exports.removeFromCallers = removeFromCallers;
/**
 * Remove an existing next action from the list of next actions
 * @param actionName - name of the action
 * @param nextAction - name of the action to remove
 * @param browser
 * @param api
 */
async function removeNext(actionName, nextAction, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeNext: actionName, nextAction', actionName, nextAction);
    let argumentsDescription = { "actionName": "string", "nextAction": "string" };
    args = (0, arguments_1.validateArguments)('removeNext', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('remove_next', args);
}
exports.removeNext = removeNext;
/**
 * Set the maximum number of calls for this action
 * @param actionName - name of the action
 * @param limit - the call limit to set
 * @param browser
 * @param api
 */
async function setCallLimit(actionName, limit, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setCallLimit: actionName, limit', actionName, limit);
    let argumentsDescription = { "actionName": "string", "limit": "number" };
    args = (0, arguments_1.validateArguments)('setCallLimit', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_call_limit', args);
}
exports.setCallLimit = setCallLimit;
/**
 * Vitaq command to enable/disable actions
 * @param actionName - name of the action to enable/disable
 * @param enabled - true sets enabled, false sets disabled
 * @param browser
 * @param api
 */
async function setEnabled(actionName, enabled, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setEnabled: actionName, enabled', actionName, enabled);
    let argumentsDescription = { "actionName": "string", "enabled": "boolean" };
    args = (0, arguments_1.validateArguments)('setEnabled', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_enabled', args);
}
exports.setEnabled = setEnabled;
/**
 * set or clear the exhaustive flag
 * @param actionName - name of the action
 * @param exhaustive - true sets exhaustive, false clears exhaustive
 * @param browser
 * @param api
 */
async function setExhaustive(actionName, exhaustive, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setExhaustive: actionName, exhaustive', actionName, exhaustive);
    let argumentsDescription = { "actionName": "string", "exhaustive": "boolean" };
    args = (0, arguments_1.validateArguments)('setExhaustive', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_exhaustive', args);
}
exports.setExhaustive = setExhaustive;
/**
 * Set the maximum allowable recursive depth
 * @param actionName - name of the action
 * @param depth - Maximum allowable recursive depth
 * @param browser
 * @param api
 */
async function setMaxActionDepth(actionName, depth = 1000, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setMaxActionDepth: actionName, depth', actionName, depth);
    let argumentsDescription = { "actionName": "string", "depth": "number" };
    args = (0, arguments_1.validateArguments)('setMaxActionDepth', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_max_sequence_depth', args);
}
exports.setMaxActionDepth = setMaxActionDepth;
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
async function allowList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = (0, arguments_1.validateArguments)('allowList', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_list', args);
}
exports.allowList = allowList;
/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
async function allowOnlyList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = (0, arguments_1.validateArguments)('allowOnlyList', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_list', args);
}
exports.allowOnlyList = allowOnlyList;
/**
 * Allow ONLY the defined range to be the allowable range for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
async function allowOnlyRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowOnlyRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_range', args);
}
exports.allowOnlyRange = allowOnlyRange;
/**
 * Allow ONLY the defined value to be the allowable value for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
async function allowOnlyValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowOnlyValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_only_value', args);
}
exports.allowOnlyValue = allowOnlyValue;
/**
 * Allow ONLY the passed list of values as the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
async function allowOnlyValues(variableName, valueList, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = (0, arguments_1.validateArguments)('allowOnlyValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length];
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index]);
    }
    // @ts-ignore
    return await api.runCommandCaller('allow_only_values', vtqArguments);
}
exports.allowOnlyValues = allowOnlyValues;
/**
 * Add the defined range to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
async function allowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_range', args);
}
exports.allowRange = allowRange;
/**
 * Add the defined value to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
async function allowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('allow_value', args);
}
exports.allowValue = allowValue;
/**
 * Add the passed list of values to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
async function allowValues(variableName, valueList, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = (0, arguments_1.validateArguments)('allowValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length];
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index]);
    }
    // @ts-ignore
    return await api.runCommandCaller('allow_values', vtqArguments);
}
exports.allowValues = allowValues;
/**
 * Remove the defined range from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
async function disallowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('disallowRange', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('disallow_range', args);
}
exports.disallowRange = disallowRange;
/**
 * Remove the defined value from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be removed
 * @param browser
 * @param api
 */
async function disallowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('disallowValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('disallow_value', args);
}
exports.disallowValue = disallowValue;
/**
 * Remove the passed list of values from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be removed
 * @param browser
 * @param api
 */
async function disallowValues(variableName, valueList, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = (0, arguments_1.validateArguments)('disallowValues', argumentsDescription, args);
    let vtqArguments = [variableName, valueList.length];
    for (let index = 0; index < valueList.length; index += 1) {
        vtqArguments.push(valueList[index]);
    }
    // @ts-ignore
    return await api.runCommandCaller('disallow_values', vtqArguments);
}
exports.disallowValues = disallowValues;
/**
 * Specify that values should not be repeated
 * @param variableName - name of the variable
 * @param value - true prevents values from being repeated
 * @param browser
 * @param api
 */
async function doNotRepeat(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('doNotRepeat: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "boolean" };
    args = (0, arguments_1.validateArguments)('doNotRepeat', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('do_not_repeat', args);
}
exports.doNotRepeat = doNotRepeat;
/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
async function gen(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('gen: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('gen', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('gen', args);
}
exports.gen = gen;
/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
async function getDoNotRepeat(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getDoNotRepeat: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('getDoNotRepeat', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_do_not_repeat', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.getDoNotRepeat = getDoNotRepeat;
/**
 * Get the starting seed being used
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
async function getSeed(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getSeed: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('getSeed', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_seed', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.getSeed = getSeed;
/**
 * Get the current value of the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
async function getValue(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getValue: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('getValue', argumentsDescription, args);
    // @ts-ignore
    let result = await api.runCommandCaller('get_value', args);
    log.info(`   -> ${result}`);
    return result;
}
exports.getValue = getValue;
/**
 * Remove all constraints on values
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
async function resetRanges(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('resetRanges: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('resetRanges', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('reset_ranges', args);
}
exports.resetRanges = resetRanges;
/**
 * Set the seed to use
 * @param variableName - name of the variable
 * @param seed - Seed to use
 * @param browser
 * @param api
 */
async function setSeed(variableName, seed, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setSeed: variableName, seed', variableName, seed);
    let argumentsDescription = { "variableName": "string", "seed": "number" };
    args = (0, arguments_1.validateArguments)('setSeed', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_seed', args);
}
exports.setSeed = setSeed;
/**
 * Manually set a value for a variable
 * @param variableName - name of the variable
 * @param value - value to set
 * @param browser
 * @param api
 */
async function setValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    args = (0, arguments_1.validateArguments)('setValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_value', args);
}
exports.setValue = setValue;
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zQXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZnVuY3Rpb25zQXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsZ0ZBQWdGO0FBQ2hGLGlDQUFpQztBQUNqQyxnRkFBZ0Y7QUFDaEYsMkNBQThDO0FBTzlDLG9DQUFvQztBQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBRzFDOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsS0FBSyxDQUFDLEVBQVUsRUFDVixPQUF1RDtJQUMvRSxJQUFJLElBQUksR0FBVyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxFQUFFLEdBQUMsSUFBSSxDQUFDLENBQUM7SUFDckQsSUFBSSxvQkFBb0IsR0FBRyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQTtJQUMzQyxJQUFBLDZCQUFpQixFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxhQUFhO0lBQ2IsT0FBTyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2hFLENBQUM7QUFURCxzQkFTQztBQUVELGdGQUFnRjtBQUNoRix3QkFBd0I7QUFDeEIsZ0ZBQWdGO0FBQ2hGOzs7OztHQUtHO0FBQ0ksS0FBSyxVQUFVLFdBQVcsQ0FBQyxZQUFvQixFQUMxQixPQUF1RCxFQUN2RCxHQUFlO0lBQ3ZDLElBQUksSUFBSSxHQUFXLEtBQUssQ0FBQyxJQUFJLENB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