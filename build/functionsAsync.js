"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValue = exports.setSeed = exports.resetRanges = exports.getValue = exports.getSeed = exports.getDoNotRepeat = exports.gen = exports.doNotRepeat = exports.disallowValues = exports.disallowValue = exports.disallowRange = exports.allowValues = exports.allowValue = exports.allowRange = exports.allowOnlyValues = exports.allowOnlyValue = exports.allowOnlyRange = exports.allowOnlyList = exports.allowList = exports.setMaxActionDepth = exports.setExhaustive = exports.setEnabled = exports.setCallLimit = exports.removeNext = exports.removeFromCallers = exports.removeAllNext = exports.numberNextActions = exports.numberActiveNextActions = exports.nextActions = exports.getPrevious = exports.getId = exports.getEnabled = exports.getCallLimit = exports.getCallCount = exports.displayNextActions = exports.clearCallCount = exports.addNext = exports.abort = exports.createVitaqLogEntry = exports.readDataFromVitaq = exports.sendDataToVitaq = exports.recordCoverage = exports.requestData = exports.sleep = void 0;
const arguments_1 = require("./arguments");
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service');
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
//     args = validateArguments("getEnabled", argumentsDescription, args);
//     // @ts-ignore
//     return await api.runCommandCaller('get_enabled', args)
// }
/**
 * Provide a simple sleep command
 * @param ms
 * @param browser
 */
async function sleep(ms, browser) {
    let args = Array.from(arguments);
    args.splice(-1, 1);
    log.debug("VitaqService: sleep: Sleeping for %s seconds", ms / 1000);
    let argumentsDescription = { "ms": "number" };
    arguments_1.validateArguments('sleep', argumentsDescription, args);
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
    log.debug("VitaqService: requestData: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    arguments_1.validateArguments('requestData', argumentsDescription, args);
    return await api.requestDataCaller(variableName);
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
    log.debug("VitaqService: recordCoverage: variablesArray ", variablesArray);
    let argumentsDescription = { "variablesArray": "array" };
    arguments_1.validateArguments('recordCoverage', argumentsDescription, args);
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
    log.debug("VitaqService: sendDataToVitaq: variableName value", variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    arguments_1.validateArguments('sendDataToVitaq', argumentsDescription, args);
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
    log.debug("VitaqService: readDataFromVitaq: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    arguments_1.validateArguments('readDataFromVitaq', argumentsDescription, args);
    return await api.readDataFromVitaqCaller(variableName);
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
async function createVitaqLogEntry(message, format, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("VitaqService: createVitaqLogEntry: message format", message, format);
    let argumentsDescription = { "message": "string", "format?": "string" };
    arguments_1.validateArguments('createVitaqLogEntry', argumentsDescription, args);
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
    log.debug('VitaqService: abort: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('abort', argumentsDescription, args);
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
    log.debug('VitaqService: addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    let argumentsDescription = { "actionName": "string", "nextAction": "string", "weight": "number" };
    args = arguments_1.validateArguments('addNext', argumentsDescription, args);
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
    log.debug('VitaqService: clearCallCount: actionName, tree', actionName, tree);
    let argumentsDescription = { "actionName": "string", "tree?": "boolean" };
    args = arguments_1.validateArguments('clearCallCount', argumentsDescription, args);
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
    log.debug('VitaqService: displayNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = args = arguments_1.validateArguments('displayNextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('display_next_sequences', args);
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
    log.debug('VitaqService: getCallCount: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('getCallCount', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_call_count', args);
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
    log.debug('VitaqService: getCallLimit: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('getCallLimit', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_call_limit', args);
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
    log.debug('VitaqService: getEnabled: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('getEnabled', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_enabled', args);
}
exports.getEnabled = getEnabled;
/**
 * Get a unique ID for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
async function getId(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getId: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('getId', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_id', args);
}
exports.getId = getId;
/**
 * Get the action run previously
 * @param actionName - name of the action
 * @param steps - how many steps to go back
 * @param browser
 * @param api
 */
function getPrevious(actionName, steps, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('VitaqService: getPrevious: actionName, steps', actionName, steps);
    let argumentsDescription = { "actionName": "string", "steps": "number" };
    args = arguments_1.validateArguments('getId', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_previous', args);
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
    log.debug('VitaqService: nextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('nextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('next_sequences', args);
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
    log.debug('VitaqService: numberActiveNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('numberActiveNextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('number_active_next_sequences', args);
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
    log.debug('VitaqService: numberNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('numberNextActions', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('number_next_sequences', args);
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
    log.debug('VitaqService: removeAllNext: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('removeAllNext', argumentsDescription, args);
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
    log.debug('VitaqService: removeFromCallers: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = arguments_1.validateArguments('removeFromCallers', argumentsDescription, args);
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
    log.debug('VitaqService: removeNext: actionName, nextAction', actionName, nextAction);
    let argumentsDescription = { "actionName": "string", "nextAction": "string" };
    args = arguments_1.validateArguments('removeNext', argumentsDescription, args);
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
    log.debug('VitaqService: setCallLimit: actionName, limit', actionName, limit);
    let argumentsDescription = { "actionName": "string", "limit": "number" };
    args = arguments_1.validateArguments('setCallLimit', argumentsDescription, args);
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
    log.debug('VitaqService: setEnabled: actionName, enabled', actionName, enabled);
    let argumentsDescription = { "actionName": "string", "enabled": "boolean" };
    args = arguments_1.validateArguments('setEnabled', argumentsDescription, args);
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
    log.debug('VitaqService: setExhaustive: actionName, exhaustive', actionName, exhaustive);
    let argumentsDescription = { "actionName": "string", "exhaustive": "boolean" };
    args = arguments_1.validateArguments('setExhaustive', argumentsDescription, args);
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
    log.debug('VitaqService: setMaxActionDepth: actionName, depth', actionName, depth);
    let argumentsDescription = { "actionName": "string", "depth": "number" };
    args = arguments_1.validateArguments('setMaxActionDepth', argumentsDescription, args);
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
    log.debug('VitaqService: allowList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = arguments_1.validateArguments('allowList', argumentsDescription, args);
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
    log.debug('VitaqService: allowOnlyList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = arguments_1.validateArguments('allowOnlyList', argumentsDescription, args);
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
    log.debug('VitaqService: allowOnlyRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "number", "high": "number" };
    args = arguments_1.validateArguments('allowOnlyRange', argumentsDescription, args);
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
    log.debug('VitaqService: allowOnlyValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "number" };
    args = arguments_1.validateArguments('allowOnlyValue', argumentsDescription, args);
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
    log.debug('VitaqService: allowOnlyValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = arguments_1.validateArguments('allowOnlyValues', argumentsDescription, args);
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
    log.debug('VitaqService: allowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "number", "high": "number" };
    args = arguments_1.validateArguments('allowRange', argumentsDescription, args);
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
    log.debug('VitaqService: allowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "number" };
    args = arguments_1.validateArguments('allowValue', argumentsDescription, args);
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
    log.debug('VitaqService: allowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = arguments_1.validateArguments('allowValues', argumentsDescription, args);
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
    log.debug('VitaqService: disallowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "number", "high": "number" };
    args = arguments_1.validateArguments('disallowRange', argumentsDescription, args);
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
    log.debug('VitaqService: disallowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "number" };
    args = arguments_1.validateArguments('disallowValue', argumentsDescription, args);
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
    log.debug('VitaqService: disallowValues: variableName, valueList', variableName, valueList);
    let argumentsDescription = { "variableName": "string", "valueList": "array" };
    args = arguments_1.validateArguments('disallowValues', argumentsDescription, args);
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
    log.debug('VitaqService: doNotRepeat: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "boolean" };
    args = arguments_1.validateArguments('doNotRepeat', argumentsDescription, args);
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
    log.debug('VitaqService: gen: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = arguments_1.validateArguments('gen', argumentsDescription, args);
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
    log.debug('VitaqService: getDoNotRepeat: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = arguments_1.validateArguments('getDoNotRepeat', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_do_not_repeat', args);
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
    log.debug('VitaqService: getSeed: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = arguments_1.validateArguments('getSeed', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_seed', args);
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
    log.debug('VitaqService: getValue: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = arguments_1.validateArguments('getValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('get_value', args);
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
    log.debug('VitaqService: resetRanges: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = arguments_1.validateArguments('resetRanges', argumentsDescription, args);
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
    log.debug('VitaqService: setSeed: variableName, seed', variableName, seed);
    let argumentsDescription = { "variableName": "string", "seed": "number" };
    args = arguments_1.validateArguments('setSeed', argumentsDescription, args);
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
    log.debug('VitaqService: setValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "number" };
    args = arguments_1.validateArguments('setValue', argumentsDescription, args);
    // @ts-ignore
    return await api.runCommandCaller('set_value', args);
}
exports.setValue = setValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zQXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZnVuY3Rpb25zQXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQThDO0FBTzlDLG9DQUFvQztBQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBRXpDLE1BQU07QUFDTixvQ0FBb0M7QUFDcEMsNENBQTRDO0FBQzVDLG9CQUFvQjtBQUNwQixnQkFBZ0I7QUFDaEIsTUFBTTtBQUNOLHVEQUF1RDtBQUN2RCx1RkFBdUY7QUFDdkYsZ0RBQWdEO0FBQ2hELGdEQUFnRDtBQUNoRCx5QkFBeUI7QUFDekIscUVBQXFFO0FBQ3JFLDBEQUEwRDtBQUMxRCwwRUFBMEU7QUFDMUUsb0JBQW9CO0FBQ3BCLDZEQUE2RDtBQUM3RCxJQUFJO0FBRUo7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxLQUFLLENBQUMsRUFBVSxFQUNWLE9BQXVEO0lBQy9FLElBQUksSUFBSSxHQUFXLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQixHQUFHLENBQUMsS0FBSyxDQUFDLDhDQUE4QyxFQUFFLEVBQUUsR0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRSxJQUFJLG9CQUFvQixHQUFHLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFBO0lBQzNDLDZCQUFpQixDQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxhQUFhO0lBQ2IsT0FBTyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFB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