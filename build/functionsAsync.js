"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValue = exports.setSeed = exports.resetRanges = exports.getValue = exports.getSeed = exports.getDoNotRepeat = exports.gen = exports.doNotRepeat = exports.disallowValues = exports.disallowValue = exports.disallowRange = exports.allowValues = exports.allowValue = exports.allowRange = exports.allowOnlyValues = exports.allowOnlyValue = exports.allowOnlyRange = exports.allowOnlyList = exports.allowList = exports.setMaxActionDepth = exports.setExhaustive = exports.setEnabled = exports.setCallLimit = exports.removeNext = exports.removeFromCallers = exports.removeAllNext = exports.numberNextActions = exports.numberActiveNextActions = exports.nextActions = exports.getId = exports.getEnabled = exports.getCallLimit = exports.getCallCount = exports.displayNextActions = exports.clearCallCount = exports.addNext = exports.abort = exports.createVitaqLogEntry = exports.readDataFromVitaq = exports.sendDataToVitaq = exports.recordCoverage = exports.requestData = exports.sleep = void 0;
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
    log.info("VitaqService: sleep: Sleeping for %s seconds", ms / 1000);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zQXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZnVuY3Rpb25zQXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQThDO0FBTzlDLG9DQUFvQztBQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBRXpDLE1BQU07QUFDTixvQ0FBb0M7QUFDcEMsNENBQTRDO0FBQzVDLG9CQUFvQjtBQUNwQixnQkFBZ0I7QUFDaEIsTUFBTTtBQUNOLHVEQUF1RDtBQUN2RCx1RkFBdUY7QUFDdkYsZ0RBQWdEO0FBQ2hELGdEQUFnRDtBQUNoRCx5QkFBeUI7QUFDekIscUVBQXFFO0FBQ3JFLDBEQUEwRDtBQUMxRCwwRUFBMEU7QUFDMUUsb0JBQW9CO0FBQ3BCLDZEQUE2RDtBQUM3RCxJQUFJO0FBRUo7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxLQUFLLENBQUMsRUFBVSxFQUNWLE9BQXVEO0lBQy9FLEdBQUcsQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsRUFBRSxHQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xFLGFBQWE7SUFDYixPQUFPLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDaEUsQ0FBQztBQUxELHNCQUtDO0FBRUQsZ0ZBQWdGO0FBQ2hGLHdCQUF3QjtBQUN4QixnRkFBZ0Y7QUFDaEY7Ozs7O0dBS0c7QUFDSSxLQUFLLFVBQVUsV0FBVyxDQUFDLFlBQW9CLEVBQzFCLE9BQXVELEVBQ3ZELEdBQWU7SUFDdkMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUNwRCxDQUFDO0FBSkQsa0NBSUM7QUFFRDs7Ozs7R0FLRztB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