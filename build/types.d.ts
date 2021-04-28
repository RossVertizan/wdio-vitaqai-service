export interface VitaqServiceOptions {
    /**
     * Specify the URL
     */
    url?: string;
    /**
     * Specify the user name
     */
    userName?: string;
    /**
     * Specify the user API key
     */
    userAPIKey?: string;
    /**
     * Specify the test activity name
     */
    testActivityName?: string;
    /**
     * Specify the project name
     */
    projectName?: string;
    /**
     * Specify a verbosityLevel 0-100 - higher is more verbose
     */
    verbosityLevel?: number;
    /**
     * Specify if we shoul duse sync or async mode
     */
    useSync?: boolean;
}
export interface MochaSuite {
    ctx: MochaContext;
    suites: MochaSuite[];
    tests: MochaTest[];
    pending: boolean;
    file?: string;
    root: boolean;
    delayed: boolean;
    parent: MochaSuite | undefined;
    title: string;
    fullTitle(): string;
}
export interface MochaContext {
    test?: MochaRunnable;
    currentTest?: MochaTest;
    _runnable: MochaRunnable;
}
export interface MochaTest {
    type: "test";
    speed?: "slow" | "medium" | "fast";
    err?: Error;
    clone(): MochaTest;
}
export interface MochaRunnable {
    title: string;
    fn: MochaFunc | MochaAsyncFunc | undefined;
    body: string;
    async: boolean;
    sync: boolean;
    timedOut: boolean;
    pending: boolean;
    duration?: number;
    parent?: MochaSuite;
    state?: "failed" | "passed";
    timer?: any;
    ctx?: MochaContext;
    callback?: MochaDone;
    allowUncaught?: boolean;
    file?: string;
}
declare type MochaDone = (err?: any) => void;
/**
 * Callback function used for tests and hooks.
 */
declare type MochaFunc = (this: MochaContext, done: MochaDone) => void;
/**
 * Async callback function used for tests and hooks.
 */
declare type MochaAsyncFunc = (this: MochaContext) => PromiseLike<any>;
export {};
//# sourceMappingURL=types.d.ts.map