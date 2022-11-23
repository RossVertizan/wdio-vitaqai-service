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
    sleep(ms: number): any;
    /**
     * Get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    requestData(variableName: string): any;
    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray: []): any;
    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName: string, value: any): any;
    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName: string): any;
    /**
     * Create an entry in the Vitaq log
     * @param message - message/data to put into the log
     * @param format - format of the message/data, can be "text" (default) or "json"
     *
     * When using the JSON option the JSON data needs to be stringified using the
     * JSON.stringify() method
     */
    createVitaqLogEntry(message: string | {}, format: string): any;
    record(variablesArray: []): any;
    writeDataToVitaq(variableName: string, value: any): any;
    write(variableName: string, value: any): any;
    read(variableName: string): any;
    log(message: string | {}, format: string): any;
    abort(actionName: string): any;
    addNext(actionName: string, nextAction: string, weight?: number): any;
    clearCallCount(actionName: string, tree: boolean): any;
    displayNextActions(actionName: string): any;
    getCallCount(actionName: string): any;
    getCallLimit(actionName: string): any;
    getEnabled(actionName: string): any;
    getPrevious(actionName: string, steps?: number): any;
    getId(actionName: string): any;
    nextActions(actionName: string): any;
    numberActiveNextActions(actionName: string): any;
    numberNextActions(actionName: string): any;
    removeAllNext(actionName: string): any;
    removeFromCallers(actionName: string): any;
    removeNext(actionName: string, nextAction: string): any;
    setCallLimit(actionName: string, limit: number): any;
    setEnabled(actionName: string, enabled: boolean): any;
    setExhaustive(actionName: string, exhaustive: boolean): any;
    setMaxActionDepth(actionName: string, depth?: number): any;
    allowList(variableName: string, list: []): any;
    allowOnlyList(variableName: string, list: []): any;
    allowOnlyRange(variableName: string, low: number, high: number): any;
    allowOnlyValue(variableName: string, value: number): any;
    allowOnlyValues(variableName: string, valueList: []): any;
    allowRange(variableName: string, low: number, high: number): any;
    allowValue(variableName: string, value: number): any;
    allowValues(variableName: string, valueList: []): any;
    disallowRange(variableName: string, low: number, high: number): any;
    disallowValue(variableName: string, value: number): any;
    disallowValues(variableName: string, valueList: []): any;
    doNotRepeat(variableName: string, value: boolean): any;
    gen(variableName: string): any;
    getDoNotRepeat(variableName: string): any;
    getSeed(variableName: string): any;
    getValue(variableName: string): any;
    resetRanges(variableName: string): any;
    setSeed(variableName: string, seed: number): any;
    setValue(variableName: string, value: any): any;
    beforeSession(config: Options.Testrunner, capabilities: Capabilities.RemoteCapability): Promise<void>;
    before(config: unknown, capabilities: unknown, browser: Browser<'async'> | MultiRemoteBrowser<'async'>): Promise<void>;
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
//# sourceMappingURL=service.d.ts.map