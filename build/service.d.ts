export = VitaqService;
declare class VitaqService {
    constructor(options: any);
    testCnt: number;
    failures: number;
    options: any;
    counter: number;
    nextActionSelector(suite: any, currentSuite: any): any;
    multiply(val1: any, val2: any): number;
    getSuite(suite: any, suiteName: any): any;
    /**
     * gather information about runner
     */
    beforeSession(config: any, capabilities: any): void;
    before(): void;
    beforeSuite(suite: any): void;
    beforeTest(test: any): void;
    afterSuite(suite: any): void;
    afterTest(test: any, context: any, results: any): void;
    /**
     * For CucumberJS
     */
    beforeFeature(uri: any, feature: any): void;
    beforeScenario(uri: any, feature: any, scenario: any): void;
    afterScenario(uri: any, feature: any, pickle: any, result: any): void;
    /**
     * update Vitaq Labs job
     */
    after(result: any): void;
    onReload(oldSessionId: any, newSessionId: any): void;
    updateJob(sessionId: any, failures: any, calledOnReload: boolean | undefined, browserName: any): Promise<void>;
    /**
     * VM message data
     */
    getBody(failures: any, calledOnReload: boolean | undefined, browserName: any): void;
    /**
     * Update the UP with the JS-executor
     * @param {number} failures
     * @returns {*}
     */
    updateUP(failures: number): any;
}
//# sourceMappingURL=service.d.ts.map