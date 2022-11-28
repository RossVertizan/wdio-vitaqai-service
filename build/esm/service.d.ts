import type { Services, Capabilities, Options } from '@wdio/types';
import type { Browser, MultiRemoteBrowser } from 'webdriverio';
interface VtqTestRunner extends Options.Testrunner {
    debug: boolean;
}
import { VitaqServiceOptions, MochaSuite } from './types';
export default class VitaqService implements Services.ServiceInstance {
    private _options;
    private _capabilities;
    private _config;
    private _counter;
    private _api;
    private _browser?;
    private _suiteMap;
    private _activeSuites;
    private vitaqFunctions;
    private _sequenceName;
    private nextActionJson;
    private nextAction;
    private currentState;
    private sessionReloadNeeded;
    private errorMessage;
    private booleanOptions;
    private numericOptions;
    private _errors;
    private _warnings;
    constructor(serviceOptions: VitaqServiceOptions, capabilities: Capabilities.RemoteCapability, config: VtqTestRunner);
    /**
     * nextActionSelector - Go to Vitaq to select the next action
     * @param suite
     * @param currentSuite
     */
    nextActionSelector(suite: MochaSuite, currentSuite: MochaSuite | undefined): Promise<void | MochaSuite | null>;
    /**
     * getNextAction - Wrapper for next action caller
     *  - originally to handle additional data i.e. message and overrideAction
     * @param lastActionName - the name of the lastAction
     * @param result - the result from the last action
     */
    getNextAction(lastActionName: string | undefined, result: boolean): Promise<void>;
    /**
     *
     * @param suite - The root suite that we will look through to find the sub-suite
     * @param suiteName - Name of the suite we are looking for
     * @returns {suite/null}
     */
    getSuite(suite: MochaSuite, suiteName: string): MochaSuite | null;
    /**
     *
     * @param fileName - Name of the file which contains the suites to run
     * @returns {suites/null}
     */
    getSuitesFromFile(fileName: string): any;
    /**
     * createSuiteMap - Create the mapping of the filename to the suites
     * @param suite - the root suite
     */
    createSuiteMap(suite: MochaSuite): void;
    /**
     * printMessages - print all of the messages from the VitaqAI API messageQueue
     */
    printMessages(): void;
    /**
     * Delete the session
     */
    deleteSession(): Promise<void>;
    /**
     * Provide a simple sleep command
     * @param duration
     */
    sleep(ms: number): void | Promise<unknown>;
    /**
     * Get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    requestData(variableName: string): unknown;
    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray: []): void | Promise<any>;
    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName: string, value: any): void | Promise<any>;
    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName: string): unknown;
    /**
     * Create an entry in the Vitaq log
     * @param message - message/data to put into the log
     * @param format - format of the message/data, can be "text" (default) or "json"
     *
     * When using the JSON option the JSON data needs to be stringified using the
     * JSON.stringify() method
     */
    createVitaqLogEntry(message: string | {}, format: string): void | Promise<any>;
    record(variablesArray: []): void | Promise<any>;
    writeDataToVitaq(variableName: string, value: any): void | Promise<any>;
    write(variableName: string, value: any): void | Promise<any>;
    read(variableName: string): unknown;
    log(message: string | {}, format: string): void | Promise<any>;
    abort(actionName: string): void | Promise<any>;
    addNext(actionName: string, nextAction: string, weight?: number): void | Promise<any>;
    clearCallCount(actionName: string, tree: boolean): void | Promise<any>;
    displayNextActions(actionName: string): unknown;
    getCallCount(actionName: string): unknown;
    getCallLimit(actionName: string): unknown;
    getEnabled(actionName: string): unknown;
    getPrevious(actionName: string, steps?: number): string | Promise<string>;
    getId(actionName: string): unknown;
    nextActions(actionName: string): unknown;
    numberActiveNextActions(actionName: string): unknown;
    numberNextActions(actionName: string): unknown;
    removeAllNext(actionName: string): void | Promise<any>;
    removeFromCallers(actionName: string): void | Promise<any>;
    removeNext(actionName: string, nextAction: string): void | Promise<any>;
    setCallLimit(actionName: string, limit: number): void | Promise<any>;
    setEnabled(actionName: string, enabled: boolean): void | Promise<any>;
    setExhaustive(actionName: string, exhaustive: boolean): void | Promise<any>;
    setMaxActionDepth(actionName: string, depth?: number): void | Promise<any>;
    allowList(variableName: string, list: []): void | Promise<any>;
    allowOnlyList(variableName: string, list: []): void | Promise<any>;
    allowOnlyRange(variableName: string, low: number, high: number): void | Promise<any>;
    allowOnlyValue(variableName: string, value: number): void | Promise<any>;
    allowOnlyValues(variableName: string, valueList: []): void | Promise<any>;
    allowRange(variableName: string, low: number, high: number): void | Promise<any>;
    allowValue(variableName: string, value: number): void | Promise<any>;
    allowValues(variableName: string, valueList: []): void | Promise<any>;
    disallowRange(variableName: string, low: number, high: number): void | Promise<any>;
    disallowValue(variableName: string, value: number): void | Promise<any>;
    disallowValues(variableName: string, valueList: []): void | Promise<any>;
    doNotRepeat(variableName: string, value: boolean): void | Promise<any>;
    gen(variableName: string): void | Promise<any>;
    getDoNotRepeat(variableName: string): unknown;
    getSeed(variableName: string): unknown;
    getValue(variableName: string): unknown;
    resetRanges(variableName: string): void | Promise<any>;
    setSeed(variableName: string, seed: number): void | Promise<any>;
    setValue(variableName: string, value: any): void | Promise<any>;
    beforeSession(config: Options.Testrunner, capabilities: Capabilities.RemoteCapability): Promise<void>;
    before(config: unknown, capabilities: unknown, browser: Browser<'async'> | MultiRemoteBrowser<'async'> | undefined): Promise<void>;
    afterSession(): Promise<void>;
    /**
     * waitForScript - Wait for test activity script
     * @param delay - delay in checking
     * @param timeout - timeout
     */
    waitForScript(timeout?: number, delay?: number): Promise<unknown>;
    /**
     * waitForSession - Wait for an established session with Vitaq
     * @param delay - delay in checking
     * @param timeout - timeout
     */
    waitForSession(timeout?: number, delay?: number): Promise<unknown>;
    getFuncName(): string;
    createArgumentString(argumentsObject: IArguments): string;
    formatCommandLineArgs(): void;
    /**
     * checkUserData - check the data supplied by the user
     * @param options
     */
    checkUserData(options: {
        [key: string]: any;
    }): void;
    /**
     * convertBooleanCommandLineArgs - takes a dictionary like object and converts
     * the provided boolean keys to true or false
     * @param options - the dictionary (i.e. key/value) like object
     * @param booleanKeys - the keys with Boolean values
     */
    convertBooleanCommandLineArgs(options: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    /**
     * convertToBool - take any string that looks as though the intention was "boolean"
     * and make it into boolean true or false
     * @param value - the value to convert
     * @param check - optional check to see of this looks like a boolean
     */
    convertToBool(value: string | boolean | undefined, check?: boolean): boolean | "not_bool" | undefined;
}
export {};
