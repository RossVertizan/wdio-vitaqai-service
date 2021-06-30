//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================

export interface VitaqServiceOptions {

    /**
     * Specify the URL
     * Defaults to "https://vitaq.online"
     */
    url?: string

    /**
     * Specify the user name
     * Defaults to undefined
     */
    userName?: string | undefined

    /**
     * Specify the user API key
     * Defaults to undefined
     */
    userAPIKey?: string | undefined

    /**
     * Specify the test activity name
     * Defaults to undefined
     */
    testActivityName?: string | undefined

    /**
     * Specify the project name
     * Defaults to undefined
     */
    projectName?: string | undefined

    /**
     * Specify if we should use sync or async mode
     * Defaults to false
     */
    useSync?: boolean

    /**
     * Specify if the browser session should be reloaded prior to the next seed,
     * at the expense of a longer test time.  Applications that store state should
     * be reloaded
     * Defaults to false
     */
    reloadSession?: boolean

    /**
     * Specify the seed to use
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    seed?: string

    /**
     * Specify the name of the sequence to run
     * Defaults to undefined
     */
    sequence?: string | undefined

    /**
     * Specify if we should use coverage
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    useCoverage?: boolean

    /**
     * Setting to indicate if a coverage hit should be recorded when an error occurs
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    hitOnError?: boolean

    /**
     * Setting to indicate if we should use artificial intelligence to close coverage
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    useAI?: boolean

    /**
     * A value for the starting variability to use for the AI, a number between
     * 0 and 1.  Determines how much exploration is done.
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    aiVariability?: number

    /**
     * A value to use for the decay of the variability, a number between
     * 0 and 1.  Specifies how quickly we move from exploration to directed.
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    aiVariabilityDecay?: number

    /**
     * Specify how many runs to complete without the coverage increasing before
     * we stop the run.
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    noProgressStop?: bigint

    /**
     * Specify if the AI should use a random seed or start from 1
     * No default value, if not specified in WDIO environment comes from VitaqUI settings
     */
    aiRandomSeed?: boolean
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
    speed?: "slow" | "medium" | "fast"; // added by reporters
    err?: Error; // added by reporters
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

// =============================================================================
// END OF FILE
// =============================================================================
