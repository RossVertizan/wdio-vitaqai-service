"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValue = exports.setSeed = exports.resetRanges = exports.getValue = exports.getSeed = exports.getDoNotRepeat = exports.gen = exports.doNotRepeat = exports.disallowValues = exports.disallowValue = exports.disallowRange = exports.allowValues = exports.allowValue = exports.allowRange = exports.allowOnlyValues = exports.allowOnlyValue = exports.allowOnlyRange = exports.allowOnlyList = exports.allowList = exports.setMaxActionDepth = exports.setExhaustive = exports.setEnabled = exports.setCallLimit = exports.removeNext = exports.removeFromCallers = exports.removeAllNext = exports.numberNextActions = exports.numberActiveNextActions = exports.nextActions = exports.getPrevious = exports.getId = exports.getEnabled = exports.getCallLimit = exports.getCallCount = exports.displayNextActions = exports.clearCallCount = exports.addNext = exports.abort = exports.createVitaqLogEntry = exports.readDataFromVitaq = exports.sendDataToVitaq = exports.recordCoverage = exports.requestData = exports.sleep = void 0;
/* eslint-disable prefer-rest-params */
//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
const arguments_js_1 = require("./arguments.js");
// import logger from '@wdio/logger'
const logger_1 = __importDefault(require("@wdio/logger"));
const log = (0, logger_1.default)('wdio-vitaqai-service');
/**
 * Provide a simple sleep command
 * @param ms
 * @param browser
 */
function sleep(ms, browser) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-1, 1);
        log.debug("sleep: Sleeping for %s seconds", ms / 1000);
        const argumentsDescription = { "ms": "number" };
        args = (0, arguments_js_1.validateArguments)('sleep', argumentsDescription, args);
        // @ts-ignore
        return yield new Promise(resolve => setTimeout(resolve, ms));
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug("requestData: variableName ", variableName);
        const argumentsDescription = { "variableName": "string" };
        args = (0, arguments_js_1.validateArguments)('requestData', argumentsDescription, args);
        const result = yield api.requestDataCaller(variableName);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.requestData = requestData;
/**
 * Get Vitaq to record coverage for the variables in the array
 * @param variablesArray - array of variables to record coverage for
 * @param browser
 * @param api
 */
function recordCoverage(variablesArray, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug("recordCoverage: variablesArray ", variablesArray);
        const argumentsDescription = { "variablesArray": "array" };
        args = (0, arguments_js_1.validateArguments)('recordCoverage', argumentsDescription, args);
        return yield api.recordCoverageCaller(variablesArray);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug("sendDataToVitaq: variableName value", variableName, value);
        const argumentsDescription = { "variableName": "string", "value": "any" };
        args = (0, arguments_js_1.validateArguments)('sendDataToVitaq', argumentsDescription, args);
        return yield api.sendDataToVitaqCaller(variableName, value);
    });
}
exports.sendDataToVitaq = sendDataToVitaq;
/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
function readDataFromVitaq(variableName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug("readDataFromVitaq: variableName ", variableName);
        const argumentsDescription = { "variableName": "string" };
        args = (0, arguments_js_1.validateArguments)('readDataFromVitaq', argumentsDescription, args);
        const result = yield api.readDataFromVitaqCaller(variableName);
        log.info(`   -> ${result}`);
        return result;
    });
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
// eslint-disable-next-line @typescript-eslint/ban-types
function createVitaqLogEntry(message, format = 'text', browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug("createVitaqLogEntry: message format", message, format);
        const argumentsDescription = { "message": "string", "format?": "string" };
        args = (0, arguments_js_1.validateArguments)('createVitaqLogEntry', argumentsDescription, args);
        return yield api.createVitaqLogEntryCaller(message, format);
    });
}
exports.createVitaqLogEntry = createVitaqLogEntry;
// =============================================================================
// Action Methods
// =============================================================================
/**
 * Abort the action causing it to not select a next action
 */
function abort(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('abort: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('abort', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('abort', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('addNext: actionName, nextAction, weight', actionName, nextAction, weight);
        const argumentsDescription = { "actionName": "string", "nextAction": "string", "weight": "number" };
        args = (0, arguments_js_1.validateArguments)('addNext', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('add_next', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('clearCallCount: actionName, tree', actionName, tree);
        const argumentsDescription = { "actionName": "string", "tree?": "boolean" };
        args = (0, arguments_js_1.validateArguments)('clearCallCount', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('clear_call_count', args);
    });
}
exports.clearCallCount = clearCallCount;
/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function displayNextActions(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('displayNextActions: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = args = (0, arguments_js_1.validateArguments)('displayNextActions', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('display_next_sequences', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.displayNextActions = displayNextActions;
/**
 * Get the current call count for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function getCallCount(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getCallCount: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('getCallCount', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('get_call_count', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.getCallCount = getCallCount;
/**
 * Get the maximum number of times this action can be called
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function getCallLimit(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getCallLimit: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('getCallLimit', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('get_call_limit', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.getCallLimit = getCallLimit;
/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function getEnabled(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getEnabled: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('getEnabled', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('get_enabled', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.getEnabled = getEnabled;
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
function getId(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getId: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('getId', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('get_id', args);
        log.info(`   -> ${result}`);
        return result;
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let result;
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getPrevious: actionName, steps', actionName, steps);
        const argumentsDescription = { "actionName": "string", "steps?": "number" };
        args = (0, arguments_js_1.validateArguments)('getPrevious', argumentsDescription, args);
        // @ts-ignore
        result = yield api.runCommandCaller('get_previous', args);
        result = JSON.parse(result).name;
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.getPrevious = getPrevious;
/**
 * Get all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function nextActions(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('nextActions: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('nextActions', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('next_sequences', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.nextActions = nextActions;
/**
 * Return the number of active next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function numberActiveNextActions(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('numberActiveNextActions: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('numberActiveNextActions', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('number_active_next_sequences', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.numberActiveNextActions = numberActiveNextActions;
/**
 * Return the number of possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function numberNextActions(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('numberNextActions: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('numberNextActions', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('number_next_sequences', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.numberNextActions = numberNextActions;
/**
 * Remove all actions in the next action list
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function removeAllNext(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('removeAllNext: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('removeAllNext', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('remove_all_next', args);
    });
}
exports.removeAllNext = removeAllNext;
/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
function removeFromCallers(actionName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('removeFromCallers: actionName', actionName);
        const argumentsDescription = { "actionName": "string" };
        args = (0, arguments_js_1.validateArguments)('removeFromCallers', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('remove_from_callers', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('removeNext: actionName, nextAction', actionName, nextAction);
        const argumentsDescription = { "actionName": "string", "nextAction": "string" };
        args = (0, arguments_js_1.validateArguments)('removeNext', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('remove_next', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('setCallLimit: actionName, limit', actionName, limit);
        const argumentsDescription = { "actionName": "string", "limit": "number" };
        args = (0, arguments_js_1.validateArguments)('setCallLimit', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('set_call_limit', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('setEnabled: actionName, enabled', actionName, enabled);
        const argumentsDescription = { "actionName": "string", "enabled": "boolean" };
        args = (0, arguments_js_1.validateArguments)('setEnabled', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('set_enabled', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('setExhaustive: actionName, exhaustive', actionName, exhaustive);
        const argumentsDescription = { "actionName": "string", "exhaustive": "boolean" };
        args = (0, arguments_js_1.validateArguments)('setExhaustive', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('set_exhaustive', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('setMaxActionDepth: actionName, depth', actionName, depth);
        const argumentsDescription = { "actionName": "string", "depth": "number" };
        args = (0, arguments_js_1.validateArguments)('setMaxActionDepth', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('set_max_sequence_depth', args);
    });
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
// eslint-disable-next-line @typescript-eslint/ban-types
function allowList(variableName, list, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowList: variableName, list', variableName, list);
        const argumentsDescription = { "variableName": "string", "list": "object" };
        args = (0, arguments_js_1.validateArguments)('allowList', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('allow_list', args);
    });
}
exports.allowList = allowList;
/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function allowOnlyList(variableName, list, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowOnlyList: variableName, list', variableName, list);
        const argumentsDescription = { "variableName": "string", "list": "object" };
        args = (0, arguments_js_1.validateArguments)('allowOnlyList', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('allow_only_list', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowOnlyRange: variableName, low, high', variableName, low, high);
        const argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
        args = (0, arguments_js_1.validateArguments)('allowOnlyRange', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('allow_only_range', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowOnlyValue: variableName, value', variableName, value);
        const argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
        args = (0, arguments_js_1.validateArguments)('allowOnlyValue', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('allow_only_value', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowOnlyValues: variableName, valueList', variableName, valueList);
        const argumentsDescription = { "variableName": "string", "valueList": "array" };
        args = (0, arguments_js_1.validateArguments)('allowOnlyValues', argumentsDescription, args);
        const vtqArguments = [variableName, valueList.length];
        for (let index = 0; index < valueList.length; index += 1) {
            vtqArguments.push(valueList[index]);
        }
        // @ts-ignore
        return yield api.runCommandCaller('allow_only_values', vtqArguments);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowRange: variableName, low, high', variableName, low, high);
        const argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
        args = (0, arguments_js_1.validateArguments)('allowRange', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('allow_range', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowValue: variableName, value', variableName, value);
        const argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
        args = (0, arguments_js_1.validateArguments)('allowValue', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('allow_value', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('allowValues: variableName, valueList', variableName, valueList);
        const argumentsDescription = { "variableName": "string", "valueList": "array" };
        args = (0, arguments_js_1.validateArguments)('allowValues', argumentsDescription, args);
        const vtqArguments = [variableName, valueList.length];
        for (let index = 0; index < valueList.length; index += 1) {
            vtqArguments.push(valueList[index]);
        }
        // @ts-ignore
        return yield api.runCommandCaller('allow_values', vtqArguments);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('disallowRange: variableName, low, high', variableName, low, high);
        const argumentsDescription = { "variableName": "string", "low": "numberOrBool", "high": "numberOrBool" };
        args = (0, arguments_js_1.validateArguments)('disallowRange', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('disallow_range', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('disallowValue: variableName, value', variableName, value);
        const argumentsDescription = { "variableName": "string", "value": "numberOrBool" };
        args = (0, arguments_js_1.validateArguments)('disallowValue', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('disallow_value', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('disallowValues: variableName, valueList', variableName, valueList);
        const argumentsDescription = { "variableName": "string", "valueList": "array" };
        args = (0, arguments_js_1.validateArguments)('disallowValues', argumentsDescription, args);
        const vtqArguments = [variableName, valueList.length];
        for (let index = 0; index < valueList.length; index += 1) {
            vtqArguments.push(valueList[index]);
        }
        // @ts-ignore
        return yield api.runCommandCaller('disallow_values', vtqArguments);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('doNotRepeat: variableName, value', variableName, value);
        const argumentsDescription = { "variableName": "string", "value": "boolean" };
        args = (0, arguments_js_1.validateArguments)('doNotRepeat', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('do_not_repeat', args);
    });
}
exports.doNotRepeat = doNotRepeat;
/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
function gen(variableName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('gen: variableName', variableName);
        const argumentsDescription = { "variableName": "string" };
        args = (0, arguments_js_1.validateArguments)('gen', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('gen', args);
    });
}
exports.gen = gen;
/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
function getDoNotRepeat(variableName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getDoNotRepeat: variableName', variableName);
        const argumentsDescription = { "variableName": "string" };
        args = (0, arguments_js_1.validateArguments)('getDoNotRepeat', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('get_do_not_repeat', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.getDoNotRepeat = getDoNotRepeat;
/**
 * Get the starting seed being used
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
function getSeed(variableName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getSeed: variableName', variableName);
        const argumentsDescription = { "variableName": "string" };
        args = (0, arguments_js_1.validateArguments)('getSeed', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('get_seed', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.getSeed = getSeed;
/**
 * Get the current value of the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
function getValue(variableName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('getValue: variableName', variableName);
        const argumentsDescription = { "variableName": "string" };
        args = (0, arguments_js_1.validateArguments)('getValue', argumentsDescription, args);
        // @ts-ignore
        const result = yield api.runCommandCaller('get_value', args);
        log.info(`   -> ${result}`);
        return result;
    });
}
exports.getValue = getValue;
/**
 * Remove all constraints on values
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
function resetRanges(variableName, browser, api) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('resetRanges: variableName', variableName);
        const argumentsDescription = { "variableName": "string" };
        args = (0, arguments_js_1.validateArguments)('resetRanges', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('reset_ranges', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('setSeed: variableName, seed', variableName, seed);
        const argumentsDescription = { "variableName": "string", "seed": "number" };
        args = (0, arguments_js_1.validateArguments)('setSeed', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('set_seed', args);
    });
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
    return __awaiter(this, arguments, void 0, function* () {
        let args = Array.from(arguments);
        args.splice(-2, 2);
        log.debug('setValue: variableName, value', variableName, value);
        const argumentsDescription = { "variableName": "string", "value": "any" };
        args = (0, arguments_js_1.validateArguments)('setValue', argumentsDescription, args);
        // @ts-ignore
        return yield api.runCommandCaller('set_value', args);
    });
}
exports.setValue = setValue;
// =============================================================================
// END OF FILE
// =============================================================================
