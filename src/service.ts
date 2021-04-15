// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service')

// Packages
// @ts-ignore
import VitaqAiApi from 'vitaqai_api'

// Type import
import type { Services, Capabilities, Options, Frameworks } from '@wdio/types'
import type { Browser, MultiRemoteBrowser } from 'webdriverio'

// Default options
import { VitaqServiceOptions, MochaSuite } from './types'
import { DEFAULT_OPTIONS } from './constants'

module.exports = class VitaqService implements Services.ServiceInstance {
    private _options: VitaqServiceOptions
    private _capabilities: Capabilities.RemoteCapability
    private _config: Options.Testrunner
    private _counter: number
    private _api: VitaqAiApi
    private _browser?: Browser<'async'> | MultiRemoteBrowser<'async'>

    constructor(
        serviceOptions: VitaqServiceOptions,
        capabilities: Capabilities.RemoteCapability,
        config: Options.Testrunner
    ) {
        log.debug("serviceOptions: ", serviceOptions);
        log.debug("capabilities: ", capabilities);
        log.debug("config: ", config);
        this._options = { ...DEFAULT_OPTIONS, ...serviceOptions };
        this._capabilities = capabilities;
        this._config = config;
        this._api = new VitaqAiApi(this._options)
        this._api.startPython()
        // @ts-ignore
        global.vitaq = this;
        this._counter = 0;
    }

    nextActionSelector(suite: MochaSuite, currentSuite: MochaSuite | undefined) {
        log.info("VitaqService: nextActionSelector: suite: ", suite)

        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite)
            log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
            // Map the passed/failed result to true and false
            let result;
            if (currentSuite.ctx._runnable.state === "passed") {
                result = true;
            } else if (currentSuite.ctx._runnable.state === "failed") {
                result = false;
            } else {
                // Didn't get either passed or failed
                log.error('VitaqService: nextActionSelector: Unexpected value for state: ',
                    currentSuite.ctx._runnable.state)
            }
        }

        // Send the result and get the next action
        if (suite.root) {
            log.info("VitaqService: nextActionSelector: This is the root suite");

            if (typeof currentSuite === "undefined") {
                log.info("VitaqService: nextActionSelector: currentSuite is undefined");
                // @ts-ignore
                return this._browser.call(() =>
                    this._api.getNextTestActionCaller(undefined, true));
            } else {
                // @ts-ignore
                return this._browser.call(() =>
                    this._api.getNextTestActionCaller(currentSuite.title, true));
            }
        }
    }

    // nextActionSelector(suite: MochaSuite, currentSuite: MochaSuite) {
    //     log.info("VitaqService: nextActionSelector: suite: ", suite)
    //     if (typeof currentSuite !== "undefined") {
    //         // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
    //         log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite)
    //         log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
    //     }
    //     if (suite.root) {
    //         log.info("VitaqService: nextActionSelector: This is the root suite");
    //         if (typeof currentSuite === "undefined") {
    //             log.info("VitaqService: nextActionSelector: currentSuite is undefined");
    //             this._counter += 1;
    //             return this.getSuite(suite, "Suite3");
    //         }
    //         else if (currentSuite.title === 'Suite3') {
    //             log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
    //             log.info("VitaqService: nextActionSelector: counter: ", this._counter);
    //             this._counter += 1;
    //             return this.getSuite(suite, "Suite2");
    //         }
    //         else if (currentSuite.title === 'Suite2') {
    //             log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
    //             log.info("VitaqService: nextActionSelector: counter: ", this._counter);
    //             this._counter += 1;
    //             return this.getSuite(suite, "Suite1");
    //         }
    //         else if (currentSuite.title === 'Suite1' && this._counter < 10) {
    //             log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
    //             log.info("VitaqService: nextActionSelector: counter: ", this._counter);
    //             this._counter += 1;
    //             return this.getSuite(suite, "Suite3");
    //         }
    //         else {
    //             return null;
    //         }
    //     }
    // }

    multiply(val1: number, val2: number) {
        return val1 * val2;
    }


    /**
     * Create an async sleep statement to test the sync capabilities in our test files
     * @param duration
     * @returns {null|*}
     */
    sleep(ms: number) {
        log.info("VitaqService: sleep: Sleeping for %s seconds", ms/1000);
        // @ts-ignore
        return global.browser.call(() =>
            new Promise(resolve => setTimeout(resolve, ms))
        );
    }

    getSuite(suite: MochaSuite, suiteName: string) {
        for (let index = 0; index < suite.suites.length; index += 1) {
            const subSuite = suite.suites[index];
            if (subSuite.fullTitle() === suiteName) {
                return subSuite;
            }
        }
        return null;
    }

    // =========================================================================
    // =========================================================================

    /**
     * gather information about runner
     */
    beforeSession (config: Options.Testrunner, capabilities: Capabilities.RemoteCapability) {
        log.info("Running the service beforeSession method")
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

    before(config: unknown, capabilities: unknown, browser: Browser<'async'> | MultiRemoteBrowser<'async'>) {
        this._browser = browser
        log.info("Running the service before method")
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
}
