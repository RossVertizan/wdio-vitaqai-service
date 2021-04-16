"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service');
// Packages
// @ts-ignore
const vitaqai_api_1 = __importDefault(require("vitaqai_api"));
const constants_1 = require("./constants");
module.exports = class VitaqService {
    constructor(serviceOptions, capabilities, config) {
        log.debug("serviceOptions: ", serviceOptions);
        log.debug("capabilities: ", capabilities);
        log.debug("config: ", config);
        this._options = { ...constants_1.DEFAULT_OPTIONS, ...serviceOptions };
        this._capabilities = capabilities;
        this._config = config;
        this._api = new vitaqai_api_1.default(this._options);
        this._api.startPython();
        // @ts-ignore
        global.vitaq = this;
        this._counter = 0;
    }
    async nextActionSelector(suite, currentSuite) {
        let nextAction;
        let result = true;
        let returnSuite;
        log.info("VitaqService: nextActionSelector: suite: ", suite);
        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite);
            log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
            // Map the passed/failed result to true and false
            if (currentSuite.ctx._runnable.state === "passed") {
                result = true;
            }
            else if (currentSuite.ctx._runnable.state === "failed") {
                result = false;
            }
            else {
                // Didn't get either passed or failed
                log.error('VitaqService: nextActionSelector: Unexpected value for state: ', currentSuite.ctx._runnable.state);
                result;
            }
        }
        // Send the result and get the next action
        if (suite.root) {
            log.info("VitaqService: nextActionSelector: This is the root suite");
            if (typeof currentSuite === "undefined") {
                log.info("VitaqService: nextActionSelector: currentSuite is undefined");
                // @ts-ignore
                // nextAction = global.browser.call(() =>
                //     this._api.getNextTestActionCaller(undefined, true));
                nextAction = await this._api.getNextTestActionCaller(undefined, result);
            }
            else {
                // @ts-ignore
                // i.getNextTestActionCaller(currentSuite.title, true));
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite.title);
                nextAction = await this._api.getNextTestActionCaller(currentSuite.title, result);
            }
            log.info("VitaqService: nextActionSelector: Returning nextAction: ", nextAction);
            // Need to return the suite object
            return this.getSuite(suite, nextAction);
        }
    }
    /**
     *
     * @param suite - The root suite that we will look through to find the sub-suite
     * @param suiteName - Name of the suite we are looking for
     * @returns {suite/null}
     */
    getSuite(suite, suiteName) {
        for (let index = 0; index < suite.suites.length; index += 1) {
            const subSuite = suite.suites[index];
            if (subSuite.fullTitle() === suiteName) {
                return subSuite;
            }
        }
        console.error("Error: Was unable to find a test action script for: ", suiteName);
        console.warn(`Make sure you have a test file with ${suiteName} as the text in the describe block`);
        console.warn(`This will cause the test to end`);
        return null;
    }
    /**
     * Vitaq command to enable/disable actions
     * @param actionName - name of tbe action to enable/disable
     * @param enabled - true sets enabled, false sets disabled
     */
    set_enabled(actionName, enabled) {
        this._api.runCommandCaller("set_enabled", arguments);
    }
    // =========================================================================
    // =========================================================================
    /**
     * gather information about runner
     */
    beforeSession(config, capabilities) {
        log.info("Running the service beforeSession method");
        // this.config = config
        // this.capabilities = capabilities
        // this.api = new VitaqLabs(this.config)
        // this.isRDC = 'testobject_api_key' in this.capabilities
        // this.isServiceEnabled = true
        /**
         * if no user and key is specified even though a sauce service was
         * provided set user and key with values so that the session request
         * will fail (not for RDC tho due to other auth mechansim)
         */
        // if (!this.isRDC && !config.user) {
        //     this.isServiceEnabled = false
        //     config.user = 'unknown_user'
        // }
        // if (!this.isRDC && !config.key) {
        //     this.isServiceEnabled = false
        //     config.key = 'unknown_key'
        // }
    }
    before(config, capabilities, browser) {
        this._browser = browser;
        log.info("Running the service before method");
        // Ensure capabilities are not null in case of multiremote
        // const capabilities = global.browser.capabilities || {}
        // this.isUP = isUnifiedPlatform(capabilities)
    }
    // beforeSuite (suite: Frameworks.Suite) {
    //     log.info("Running the service beforeSuite method")
    //     // this.suiteTitle = suite.title
    //     // if (this.options.setJobNameInBeforeSuite && !this.isUP) {
    //     //     global.browser.execute('sauce:job-name=' + this.suiteTitle)
    //     // }
    // }
    //
    // beforeTest (test: Frameworks.Test) {
    //     log.info("Running the service beforeSession method")
    //     /**
    //      * Date:    20200714
    //      * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
    //      */
    //     // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
    //     //     return
    //     // }
    //
    //     /**
    //      * in jasmine we get Jasmine__TopLevel__Suite as title since service using test
    //      * framework hooks in order to execute async functions.
    //      * This tweak allows us to set the real suite name for jasmine jobs.
    //      */
    //     /* istanbul ignore if */
    //     // if (this.suiteTitle === 'Jasmine__TopLevel__Suite') {
    //     //     this.suiteTitle = test.fullName.slice(0, test.fullName.indexOf(test.description) - 1)
    //     // }
    //
    //     // const fullTitle = (
    //     //     /**
    //     //      * Jasmine
    //     //      */
    //     //     test.fullName ||
    //     //     /**
    //     //      * Mocha
    //     //      */
    //     //     `${test.parent} - ${test.title}`
    //     // )
    //     // global.browser.execute('sauce:context=' + fullTitle)
    // }
    //
    // afterSuite (suite: Frameworks.Suite) {
    //     log.info("Running the service afterSuite method")
    //     // if (Object.prototype.hasOwnProperty.call(suite, 'error')) {
    //     //     ++this.failures
    //     // }
    // }
    //
    // afterTest (test: Frameworks.Test, context, results) {
    //     log.info("Running the service afterTest method")
    //     /**
    //      * remove failure if test was retried and passed
    //      * > Mocha only
    //      */
    //     // if (test._retriedTest && results.passed) {
    //     //     --this.failures
    //     //     return
    //     // }
    //
    //     /**
    //      * don't bump failure number if test was retried and still failed
    //      * > Mocha only
    //      */
    //     // if (test._retriedTest && !results.passed && test._currentRetry < test._retries) {
    //     //     return
    //     // }
    //     //
    //     // if (!results.passed) {
    //     //     ++this.failures
    //     // }
    // }
    //
    // /**
    //  * For CucumberJS
    //  */
    // beforeFeature (uri, feature) {
    //     log.info("Running the service beforeFeature method")
    //     /**
    //      * Date:    20200714
    //      * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
    //      */
    //     // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
    //     //     return
    //     // }
    //     //
    //     // this.suiteTitle = feature.document.feature.name
    //     // global.browser.execute('sauce:context=Feature: ' + this.suiteTitle)
    // }
    //
    // beforeScenario (uri, feature, scenario) {
    //     log.info("Running the service beforeScenario method")
    //     /**
    //      * Date:    20200714
    //      * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
    //      */
    //     // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
    //     //     return
    //     // }
    //     //
    //     // const scenarioName = scenario.name
    //     // global.browser.execute('sauce:context=Scenario: ' + scenarioName)
    // }
    //
    // afterScenario(uri, feature, pickle, result) {
    //     log.info("Running the service afterScenario method")
    //     // if (result.status === 'failed') {
    //     //     ++this.failures
    //     // }
    // }
    //
    // /**
    //  * update Vitaq Labs job
    //  */
    // after (result) {
    //     log.info("Running the service after method")
    //     // if (!this.isServiceEnabled && !this.isRDC) {
    //     //     return
    //     // }
    //     //
    //     // let failures = this.failures
    //     //
    //     // /**
    //     //  * set failures if user has bail option set in which case afterTest and
    //     //  * afterSuite aren't executed before after hook
    //     //  */
    //     // if (global.browser.config.mochaOpts && global.browser.config.mochaOpts.bail && Boolean(result)) {
    //     //     failures = 1
    //     // }
    //     //
    //     // const status = 'status: ' + (failures > 0 ? 'failing' : 'passing')
    //     // if (!global.browser.isMultiremote) {
    //     //     log.info(`Update job with sessionId ${global.browser.sessionId}, ${status}`)
    //     //     return this.isUP ? this.updateUP(failures) : this.updateJob(global.browser.sessionId, failures)
    //     // }
    //     //
    //     // return Promise.all(Object.keys(this.capabilities).map((browserName) => {
    //     //     log.info(`Update multiremote job for browser "${browserName}" and sessionId ${global.browser[browserName].sessionId}, ${status}`)
    //     //     return this.isUP ? this.updateUP(failures) : this.updateJob(global.browser[browserName].sessionId, failures, false, browserName)
    //     // }))
    // }
    //
    // onReload (oldSessionId, newSessionId) {
    //     log.info("Running the service onReload method")
    //     // if (!this.isServiceEnabled && !this.isRDC) {
    //     //     return
    //     // }
    //     //
    //     // const status = 'status: ' + (this.failures > 0 ? 'failing' : 'passing')
    //     //
    //     // if (!global.browser.isMultiremote) {
    //     //     log.info(`Update (reloaded) job with sessionId ${oldSessionId}, ${status}`)
    //     //     return this.updateJob(oldSessionId, this.failures, true)
    //     // }
    //     //
    //     // const browserName = global.browser.instances.filter(
    //     //     (browserName) => global.browser[browserName].sessionId === newSessionId)[0]
    //     // log.info(`Update (reloaded) multiremote job for browser "${browserName}" and sessionId ${oldSessionId}, ${status}`)
    //     // return this.updateJob(oldSessionId, this.failures, true, browserName)
    // }
    //
    // async updateJob (sessionId, failures, calledOnReload = false, browserName) {
    //     log.info("Running the service updateJob method")
    //     // if (this.isRDC) {
    //     //     await this.api.updateTest(sessionId, { passed: failures === 0 })
    //     //     this.failures = 0
    //     //     return
    //     // }
    //     //
    //     // const body = this.getBody(failures, calledOnReload, browserName)
    //     // await this.api.updateJob(this.config.user, sessionId, body)
    //     // this.failures = 0
    // }
    //
    // /**
    //  * VM message data
    //  */
    // getBody (failures, calledOnReload = false, browserName) {
    //     log.info("Running the service getBody method")
    //     // let body = {}
    //     //
    //     // /**
    //     //  * set default values
    //     //  */
    //     // body.name = this.suiteTitle
    //     //
    //     // if (browserName) {
    //     //     body.name = `${browserName}: ${body.name}`
    //     // }
    //     //
    //     // /**
    //     //  * add reload count to title if reload is used
    //     //  */
    //     // if (calledOnReload || this.testCnt) {
    //     //     let testCnt = ++this.testCnt
    //     //
    //     //     if (global.browser.isMultiremote) {
    //     //         testCnt = Math.ceil(testCnt / global.browser.instances.length)
    //     //     }
    //     //
    //     //     body.name += ` (${testCnt})`
    //     // }
    //     //
    //     // let caps = this.capabilities['sauce:options'] || this.capabilities
    //     //
    //     // for (let prop of jobDataProperties) {
    //     //     if (!caps[prop]) {
    //     //         continue
    //     //     }
    //     //
    //     //     body[prop] = caps[prop]
    //     // }
    //     //
    //     // body.passed = failures === 0
    //     // return body
    // }
    //
    // /**
    //  * Update the UP with the JS-executor
    //  * @param {number} failures
    //  * @returns {*}
    //  */
    // updateUP(failures){
    //     log.info("Running the service updateUP method")
    //     // return global.browser.execute(`sauce:job-result=${failures === 0}`)
    // }
    /**
     * Create an async sleep statement to test the sync capabilities in our test files
     * @param duration
     * @returns {null|*}
     */
    sleep(ms) {
        log.info("VitaqService: sleep: Sleeping for %s seconds", ms / 1000);
        // @ts-ignore
        return global.browser.call(() => new Promise(resolve => setTimeout(resolve, ms)));
    }
};
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFFekMsV0FBVztBQUNYLGFBQWE7QUFDYiw4REFBb0M7QUFRcEMsMkNBQTZDO0FBRTdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxZQUFZO0lBUS9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLDJCQUFlLEVBQUUsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkscUJBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUN2QixhQUFhO1FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLFlBQW9DO1FBQzVFLElBQUks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