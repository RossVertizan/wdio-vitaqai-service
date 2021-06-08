import VitaqAiApi from 'vitaqai_api';
import type { Browser, MultiRemoteBrowser } from 'webdriverio';
/**
 * Provide a simple sleep command
 * @param ms
 * @param browser
 */
export declare function sleep(ms: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>): Promise<unknown>;
/**
 * Get Vitaq to generate a new value for the variable and then get it
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export declare function requestData(variableName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get Vitaq to record coverage for the variables in the array
 * @param variablesArray - array of variables to record coverage for
 * @param browser
 * @param api
 */
export declare function recordCoverage(variablesArray: [], browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Send data to Vitaq and record it on the named variable
 * @param variableName - name of the variable
 * @param value - value to store
 * @param browser
 * @param api
 */
export declare function sendDataToVitaq(variableName: string, value: any, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Read data from a variable in Vitaq
 * @param variableName - name of the variable to read
 * @param browser
 * @param api
 */
export declare function readDataFromVitaq(variableName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
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
export declare function createVitaqLogEntry(message: string | {}, format: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Abort the action causing it to not select a next action
 */
export declare function abort(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Add an action that can be called after this one
 * @param actionName - name of the action
 * @param nextAction - name of the action that could be called next
 * @param weight - Weight for the selection of the next action
 * @param browser
 * @param api
 */
export declare function addNext(actionName: string, nextAction: string, weight: number | undefined, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Set the call_count back to zero
 * @param actionName - name of the action
 * @param tree - clear call counts on all next actions
 * @param browser
 * @param api
 */
export declare function clearCallCount(actionName: string, tree: boolean, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get a string listing all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function displayNextActions(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get the current call count for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function getCallCount(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get the maximum number of times this action can be called
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function getCallLimit(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function getEnabled(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get a unique ID for this action
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function getId(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get the action run previously
 * @param actionName - name of the action
 * @param steps - how many steps to go back
 * @param browser
 * @param api
 */
export declare function getPrevious(actionName: string, steps: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): any;
/**
 * Get all of the possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function nextActions(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Return the number of active next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function numberActiveNextActions(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Return the number of possible next actions
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function numberNextActions(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Remove all actions in the next action list
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function removeAllNext(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Remove this action from all callers lists
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export declare function removeFromCallers(actionName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Remove an existing next action from the list of next actions
 * @param actionName - name of the action
 * @param nextAction - name of the action to remove
 * @param browser
 * @param api
 */
export declare function removeNext(actionName: string, nextAction: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Set the maximum number of calls for this action
 * @param actionName - name of the action
 * @param limit - the call limit to set
 * @param browser
 * @param api
 */
export declare function setCallLimit(actionName: string, limit: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Vitaq command to enable/disable actions
 * @param actionName - name of the action to enable/disable
 * @param enabled - true sets enabled, false sets disabled
 * @param browser
 * @param api
 */
export declare function setEnabled(actionName: string, enabled: boolean, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * set or clear the exhaustive flag
 * @param actionName - name of the action
 * @param exhaustive - true sets exhaustive, false clears exhaustive
 * @param browser
 * @param api
 */
export declare function setExhaustive(actionName: string, exhaustive: boolean, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Set the maximum allowable recursive depth
 * @param actionName - name of the action
 * @param depth - Maximum allowable recursive depth
 * @param browser
 * @param api
 */
export declare function setMaxActionDepth(actionName: string, depth: number | undefined, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Specify a list to add to the existing list in a list variable
 * @param variableName - name of the variable
 * @param list - The list to add to the existing list
 * @param browser
 * @param api
 */
export declare function allowList(variableName: string, list: [] | {}, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Specify the ONLY list to select from in a list variable
 * @param variableName - name of the variable
 * @param list - The list to be used for selecting from
 * @param browser
 * @param api
 */
export declare function allowOnlyList(variableName: string, list: [] | {}, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Allow ONLY the defined range to be the allowable range for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export declare function allowOnlyRange(variableName: string, low: number, high: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Allow ONLY the defined value to be the allowable value for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export declare function allowOnlyValue(variableName: string, value: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Allow ONLY the passed list of values as the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export declare function allowOnlyValues(variableName: string, valueList: [], browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Add the defined range to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export declare function allowRange(variableName: string, low: number, high: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Add the defined value to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be allowed
 * @param browser
 * @param api
 */
export declare function allowValue(variableName: string, value: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Add the passed list of values to the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be allowed
 * @param browser
 * @param api
 */
export declare function allowValues(variableName: string, valueList: [], browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Remove the defined range from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param low - Lower limit of the range
 * @param high - Upper limit of the range
 * @param browser
 * @param api
 */
export declare function disallowRange(variableName: string, low: number, high: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Remove the defined value from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param value - The value to be removed
 * @param browser
 * @param api
 */
export declare function disallowValue(variableName: string, value: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Remove the passed list of values from the allowable values for the integer variable
 * @param variableName - name of the variable
 * @param valueList - list of values that should be removed
 * @param browser
 * @param api
 */
export declare function disallowValues(variableName: string, valueList: [], browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Specify that values should not be repeated
 * @param variableName - name of the variable
 * @param value - true prevents values from being repeated
 * @param browser
 * @param api
 */
export declare function doNotRepeat(variableName: string, value: boolean, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * get Vitaq to generate a new value for the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export declare function gen(variableName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get the current status of do not repeat
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export declare function getDoNotRepeat(variableName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get the starting seed being used
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export declare function getSeed(variableName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Get the current value of the variable
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export declare function getValue(variableName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Remove all constraints on values
 * @param variableName - name of the variable
 * @param browser
 * @param api
 */
export declare function resetRanges(variableName: string, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Set the seed to use
 * @param variableName - name of the variable
 * @param seed - Seed to use
 * @param browser
 * @param api
 */
export declare function setSeed(variableName: string, seed: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
/**
 * Manually set a value for a variable
 * @param variableName - name of the variable
 * @param value - value to set
 * @param browser
 * @param api
 */
export declare function setValue(variableName: string, value: number, browser: Browser<'async'> | MultiRemoteBrowser<'async'>, api: VitaqAiApi): Promise<any>;
//# sourceMappingURL=functionsAsync.d.ts.map