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
function sleep(ms, browser) {
    let args = Array.from(arguments);
    args.splice(-1, 1);
    log.debug("sleep: Sleeping for %s seconds", ms / 1000);
    let argumentsDescription = { "ms": "number" };
    (0, arguments_1.validateArguments)('sleep', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => new Promise(resolve => setTimeout(resolve, ms)));
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
function requestData(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("requestData: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    (0, arguments_1.validateArguments)('requestData', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.requestDataCaller(variableName));
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
function recordCoverage(variablesArray, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("recordCoverage: variablesArray ", variablesArray);
    let argumentsDescription = { "variablesArray": "array" };
    (0, arguments_1.validateArguments)('recordCoverage', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.recordCoverageCaller(variablesArray));
}
exports.recordCoverage = recordCoverage;
/**
 * Send data to Vitaq and record it on the named variable
 * @param variableName - name of the variable
 * @param value - value to store
 * @param browser
 * @param api
 */
function sendDataToVitaq(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("sendDataToVitaq: variableName value", variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    (0, arguments_1.validateArguments)('sendDataToVitaq', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.sendDataToVitaqCaller(variableName, value));
}
exports.sendDataToVitaq = sendDataToVitaq;
/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
function readDataFromVitaq(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("readDataFromVitaq: variableName ", variableName);
    let argumentsDescription = { "variableName": "string" };
    (0, arguments_1.validateArguments)('readDataFromVitaq', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.readDataFromVitaqCaller(variableName));
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
function createVitaqLogEntry(message, format, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug("createVitaqLogEntry: message format", message, format);
    let argumentsDescription = { "message": "string", "format?": "string" };
    (0, arguments_1.validateArguments)('createVitaqLogEntry', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.createVitaqLogEntryCaller(message, format));
}
exports.createVitaqLogEntry = createVitaqLogEntry;
// =============================================================================
// Action Methods
// =============================================================================
/**
 * Abort the action causing it to not select a next action
 */
function abort(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('abort: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('abort', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('abort', args));
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
function addNext(actionName, nextAction, weight = 1, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('addNext: actionName, nextAction, weight', actionName, nextAction, weight);
    let argumentsDescription = { "actionName": "string", "nextAction": "string", "weight": "number" };
    args = (0, arguments_1.validateArguments)('addNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('add_next', args));
}
exports.addNext = addNext;
/**
 * Set the call_count back to zero
 * @param actionName - name of the action
 * @param tree - clear call counts on all next actions
 * @param browser
 * @param api
 */
function clearCallCount(actionName, tree, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('clearCallCount: actionName, tree', actionName, tree);
    let argumentsDescription = { "actionName": "string", "tree?": "boolean" };
    args = (0, arguments_1.validateArguments)('clearCallCount', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('clear_call_count', args));
}
exports.clearCallCount = clearCallCount;
/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function displayNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('displayNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('displayNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('display_next_sequences', args));
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
function getCallCount(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallCount: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getCallCount', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_call_count', args));
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
function getCallLimit(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getCallLimit: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getCallLimit', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_call_limit', args));
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
function getEnabled(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getEnabled: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getEnabled', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_enabled', args));
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
function getId(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getId: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('getId', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_id', args));
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
function getPrevious(actionName, steps, browser, api) {
    let result;
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getPrevious: actionName, steps', actionName, steps);
    let argumentsDescription = { "actionName": "string", "steps?": "number" };
    args = (0, arguments_1.validateArguments)('getPrevious', argumentsDescription, args);
    // @ts-ignore
    result = browser.call(() => api.runCommandCaller('get_previous', args));
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
function nextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('nextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('nextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('next_sequences', args));
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
function numberActiveNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberActiveNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('numberActiveNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('number_active_next_sequences', args));
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
function numberNextActions(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('numberNextActions: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('numberNextActions', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('number_next_sequences', args));
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
function removeAllNext(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeAllNext: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('removeAllNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('remove_all_next', args));
}
exports.removeAllNext = removeAllNext;
/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function removeFromCallers(actionName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeFromCallers: actionName', actionName);
    let argumentsDescription = { "actionName": "string" };
    args = (0, arguments_1.validateArguments)('removeFromCallers', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('remove_from_callers', args));
}
exports.removeFromCallers = removeFromCallers;
/**
 * Remove an existing next action from the list of next actions
 * @param actionName - name of the action
 * @param nextAction - name of the action to remove
 * @param browser
 * @param api
 */
function removeNext(actionName, nextAction, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('removeNext: actionName, nextAction', actionName, nextAction);
    let argumentsDescription = { "actionName": "string", "nextAction": "string" };
    args = (0, arguments_1.validateArguments)('removeNext', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('remove_next', args));
}
exports.removeNext = removeNext;
/**
 * Set the maximum number of calls for this action
 * @param actionName - name of the action
 * @param limit - the call limit to set
 * @param browser
 * @param api
 */
function setCallLimit(actionName, limit, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setCallLimit: actionName, limit', actionName, limit);
    let argumentsDescription = { "actionName": "string", "limit": "number" };
    args = (0, arguments_1.validateArguments)('setCallLimit', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_call_limit', args));
}
exports.setCallLimit = setCallLimit;
/**
 * Vitaq command to enable/disable actions
 * @param actionName - name of the action to enable/disable
 * @param enabled - true sets enabled, false sets disabled
 * @param browser
 * @param api
 */
function setEnabled(actionName, enabled, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setEnabled: actionName, enabled', actionName, enabled);
    let argumentsDescription = { "actionName": "string", "enabled": "boolean" };
    args = (0, arguments_1.validateArguments)('setEnabled', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_enabled', args));
}
exports.setEnabled = setEnabled;
/**
 * set or clear the exhaustive flag
 * @param actionName - name of the action
 * @param exhaustive - true sets exhaustive, false clears exhaustive
 * @param browser
 * @param api
 */
function setExhaustive(actionName, exhaustive, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setExhaustive: actionName, exhaustive', actionName, exhaustive);
    let argumentsDescription = { "actionName": "string", "exhaustive": "boolean" };
    args = (0, arguments_1.validateArguments)('setExhaustive', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_exhaustive', args));
}
exports.setExhaustive = setExhaustive;
/**
 * Set the maximum allowable recursive depth
 * @param actionName - name of the action
 * @param depth - Maximum allowable recursive depth
 * @param browser
 * @param api
 */
function setMaxActionDepth(actionName, depth = 1000, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setMaxActionDepth: actionName, depth', actionName, depth);
    let argumentsDescription = { "actionName": "string", "depth": "number" };
    args = (0, arguments_1.validateArguments)('setMaxActionDepth', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_max_sequence_depth', args));
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
function allowList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = (0, arguments_1.validateArguments)('allowList', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_list', args));
}
exports.allowList = allowList;
/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
function allowOnlyList(variableName, list, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyList: variableName, list', variableName, list);
    let argumentsDescription = { "variableName": "string", "list": "object" };
    args = (0, arguments_1.validateArguments)('allowOnlyList', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_only_list', args));
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
function allowOnlyRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowOnlyRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_only_range', args));
}
exports.allowOnlyRange = allowOnlyRange;
/**
 * Allow ONLY the defined value to be the allowable value for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
function allowOnlyValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowOnlyValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowOnlyValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_only_value', args));
}
exports.allowOnlyValue = allowOnlyValue;
/**
 * Allow ONLY the passed list of values as the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
function allowOnlyValues(variableName, valueList, browser, api) {
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
    browser.call(() => api.runCommandCaller('allow_only_values', vtqArguments));
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
function allowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_range', args));
}
exports.allowRange = allowRange;
/**
 * Add the defined value to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
function allowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('allowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('allowValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('allow_value', args));
}
exports.allowValue = allowValue;
/**
 * Add the passed list of values to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
function allowValues(variableName, valueList, browser, api) {
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
    browser.call(() => api.runCommandCaller('allow_values', vtqArguments));
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
function disallowRange(variableName, low, high, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowRange: variableName, low, high', variableName, low, high);
    let argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('disallowRange', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('disallow_range', args));
}
exports.disallowRange = disallowRange;
/**
 * Remove the defined value from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be removed
 * @param browser
 * @param api
 */
function disallowValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('disallowValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
    args = (0, arguments_1.validateArguments)('disallowValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('disallow_value', args));
}
exports.disallowValue = disallowValue;
/**
 * Remove the passed list of values from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be removed
 * @param browser
 * @param api
 */
function disallowValues(variableName, valueList, browser, api) {
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
    browser.call(() => api.runCommandCaller('disallow_values', vtqArguments));
}
exports.disallowValues = disallowValues;
/**
 * Specify that values should not be repeated
 * @param variableName - name of the variable
 * @param value - true prevents values from being repeated
 * @param browser
 * @param api
 */
function doNotRepeat(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('doNotRepeat: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "boolean" };
    args = (0, arguments_1.validateArguments)('doNotRepeat', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('do_not_repeat', args));
}
exports.doNotRepeat = doNotRepeat;
/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
function gen(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('gen: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('gen', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('gen', args));
}
exports.gen = gen;
/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
function getDoNotRepeat(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getDoNotRepeat: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('getDoNotRepeat', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_do_not_repeat', args));
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
function getSeed(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getSeed: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('getSeed', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_seed', args));
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
function getValue(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('getValue: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('getValue', argumentsDescription, args);
    // @ts-ignore
    let result = browser.call(() => api.runCommandCaller('get_value', args));
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
function resetRanges(variableName, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('resetRanges: variableName', variableName);
    let argumentsDescription = { "variableName": "string" };
    args = (0, arguments_1.validateArguments)('resetRanges', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('reset_ranges', args));
}
exports.resetRanges = resetRanges;
/**
 * Set the seed to use
 * @param variableName - name of the variable
 * @param seed - Seed to use
 * @param browser
 * @param api
 */
function setSeed(variableName, seed, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setSeed: variableName, seed', variableName, seed);
    let argumentsDescription = { "variableName": "string", "seed": "number" };
    args = (0, arguments_1.validateArguments)('setSeed', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_seed', args));
}
exports.setSeed = setSeed;
/**
 * Manually set a value for a variable
 * @param variableName - name of the variable
 * @param value - value to set
 * @param browser
 * @param api
 */
function setValue(variableName, value, browser, api) {
    let args = Array.from(arguments);
    args.splice(-2, 2);
    log.debug('setValue: variableName, value', variableName, value);
    let argumentsDescription = { "variableName": "string", "value": "any" };
    args = (0, arguments_1.validateArguments)('setValue', argumentsDescription, args);
    // @ts-ignore
    browser.call(() => api.runCommandCaller('set_value', args));
}
exports.setValue = setValue;
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zU3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mdW5jdGlvbnNTeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGO0FBQ2hGLDJDQUE4QztBQU85QyxvQ0FBb0M7QUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUMvQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUUxQzs7OztHQUlHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEVBQVUsRUFDVixPQUF1RDtJQUN6RSxJQUFJLElBQUksR0FBVyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxFQUFFLEdBQUMsSUFBSSxDQUFDLENBQUM7SUFDckQsSUFBSSxvQkFBb0IsR0FBRyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQTtJQUMzQyxJQUFBLDZCQUFpQixFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxhQUFhO0lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDZCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FDbEQsQ0FBQztBQUNOLENBQUM7QUFYRCxzQkFXQztBQUVELGdGQUFnRjtBQUNoRix3QkFBd0I7QUFDeEIsZ0ZBQWdGO0FBQ2hGOzs7OztHQUtHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLFlBQW9CLEVBQ3BCLE9BQXVELEVBQ3ZELEdBQWU7SUFDdkMsSUFBSSxJQUFJLEdB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