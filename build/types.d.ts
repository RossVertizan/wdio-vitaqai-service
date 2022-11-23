export interface VitaqServiceOptions {
    /**
     * Specify the URL
     * Defaults to the value of VTQ_RUNNER_URL or "https://vitaq.online"
     */
    url?: string;
    /**
     * Specify the user name
     * Defaults to undefined
     */
    userName?: string | undefined;
    /**
     * Specify the user API key
     * Defaults to undefined
     */
    userAPIKey?: string | undefined;
    /**
     * Specify the test activity name
     * Defaults to undefined
     */
    testActivityName?: string | undefined;
    /**
     * Specify the project name
     * Defaults to undefined
     */
    projectName?: string | undefined;
    /**
     * Specify if we should use sync or async mode
     * Defaults to false
     */
    useSync?: boolean;
    /**
     * Specify if the browser session should be reloaded prior to the next seed,
     * at the expense of a longer test time.  Applications that store state should
     * be reloaded
     * Defaults to false
     */
    reloadSession?: boolean;
    /**
     * Specify the seed to use
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    seed?: string;
    /**
     * Specify the name of the sequence to run
     * Defaults to undefined
     */
    sequence?: string | undefined;
    /**
     * Specify that all sequences should be run straight through avoiding AI
     * Defaults to false
     */
    sequences?: boolean;
    /**
     * Specify that actions with remaining coverage requirements after sequences are complete
     * should be found and executed
     * Defaults to false
     */
    actions?: boolean;
    /**
     * Specify the timeout to use for the authentication with the runner
     * Defaults to 20000 ms (60000 ms in debug mode)
     */
    authenticationTimeout?: number;
    /**
     * Specify the timeout to use when waiting for the next action from the Vitaq script
     * Defaults to 300000 ms (3600000 ms (1 hour) in debug mode)
     */
    nextActionTimeout?: number;
    /**
     * Specify the timeout to use when waiting for the Python script
     * Defaults to 20000 ms (60000 ms in debug mode)
     */
    scriptTimeout?: number;
    /**
     * Specify the timeout to use when waiting to connect with the runner
     * Defaults to 20000 ms (60000 ms in debug mode)
     */
    sessionTimeout?: number;
    /**
     * Specify if we should use the debug settings (the timeouts as shown above)
     * This is simply a shorthand for changing all the timeouts to debug defaults
     * Defaults to false
     */
    debug?: boolean;
    /**
     * Specify if we should use coverage
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    useCoverage?: boolean;
    /**
     * Setting to indicate if a coverage hit should be recorded when an error occurs
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    hitOnError?: boolean;
    /**
     * Setting to indicate if we should use artificial intelligence to close coverage
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    useAI?: boolean;
    /**
     * A value for the starting variability to use for the AI, a number between
     * 0 and 1.  Determines how much exploration is done.
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    aiVariability?: number;
    /**
     * A value to use for the decay of the variability, a number between
     * 0 and 1.  Specifies how quickly we move from exploration to directed.
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    aiVariabilityDecay?: number;
    /**
     * Specify how many runs to complete without the coverage increasing before
     * we stop the run.
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    noProgressStop?: bigint;
    /**
     * Specify if the AI should use a random seed or start from 1
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    aiRandomSeed?: boolean;
    /**
     * PRIVATE OPTION
     * Stop on Vitaq errors - this is a private option to allow for negative
     * testing of the solution where we DO NOT want to stop on errors from Vitaq
     * as that is what we are testing.
     * Defaults to true
     */
    _stopOnVitaqError?: boolean;
    /**
     * PRIVATE OPTION
     * Use a local Vitaq Runner - this is a private option for debugging purposes only
     * and not available to customers
     * Defaults to false
     */
    _local?: boolean;
    /**
     * PRIVATE OPTION
     * Do NOT rewrite the test script each run - this is a private option for debugging purposes only
     * and not available to customers
     * Defaults to false
     */
    _noscriptwrite?: boolean;
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
    state?: "failed" | "passed" | "pending";
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
type MochaDone = (err?: any) => void;
/**
 * Callback function used for tests and hooks.
 */
type MochaFunc = (this: MochaContext, done: MochaDone) => void;
/**
 * Async callback function used for tests and hooks.
 */
type MochaAsyncFunc = (this: MochaContext) => PromiseLike<any>;
export {};
//# sourceMappingURL=types.d.ts.map