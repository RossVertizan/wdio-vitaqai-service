"use strict";
// import VitaqLabs from 'saucelabs'
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
// console.log("This is logger: ", logger);
// import { isUnifiedPlatform } from './utils'
// const jobDataProperties = ['name', 'tags', 'public', 'build', 'custom-data']
const log = logger('@wdio/vitaq-service');
module.exports = class VitaqService {
    constructor(options) {
        this.testCnt = 0;
        this.failures = 0; // counts failures between reloads
        this.options = options || {};
        console.log('VitaqService: global: ', global);
        global.vitaq = this;
        console.log('VitaqService: global: ', global);
        this.counter = 0;
    }
    nextActionSelector(suite, currentSuite) {
        log.info("VitaqService: nextActionSelector: suite: ", suite);
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite);
            log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
        }
        if (suite.root) {
            log.info("VitaqService: nextActionSelector: This is the root suite");
            if (typeof currentSuite === "undefined") {
                log.info("VitaqService: nextActionSelector: currentSuite is undefined");
                this.counter += 1;
                return this.getSuite(suite, "Suite3");
            }
            else if (currentSuite.title === 'Suite3') {
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
                log.info("VitaqService: nextActionSelector: counter: ", this.counter);
                this.counter += 1;
                return this.getSuite(suite, "Suite2");
            }
            else if (currentSuite.title === 'Suite2') {
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
                log.info("VitaqService: nextActionSelector: counter: ", this.counter);
                this.counter += 1;
                return this.getSuite(suite, "Suite1");
            }
            else if (currentSuite.title === 'Suite1' && this.counter < 10) {
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
                log.info("VitaqService: nextActionSelector: counter: ", this.counter);
                this.counter += 1;
                return this.getSuite(suite, "Suite3");
            }
            else {
                return null;
            }
        }
    }
    multiply(val1, val2) {
        return val1 * val2;
    }
    getSuite(suite, suiteName) {
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
    before() {
        log.info("Running the service before method");
        // Ensure capabilities are not null in case of multiremote
        // const capabilities = global.browser.capabilities || {}
        // this.isUP = isUnifiedPlatform(capabilities)
    }
    beforeSuite(suite) {
        log.info("Running the service beforeSuite method");
        // this.suiteTitle = suite.title
        // if (this.options.setJobNameInBeforeSuite && !this.isUP) {
        //     global.browser.execute('sauce:job-name=' + this.suiteTitle)
        // }
    }
    beforeTest(test) {
        log.info("Running the service beforeSession method");
        /**
         * Date:    20200714
         * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
         */
        // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
        //     return
        // }
        /**
         * in jasmine we get Jasmine__TopLevel__Suite as title since service using test
         * framework hooks in order to execute async functions.
         * This tweak allows us to set the real suite name for jasmine jobs.
         */
        /* istanbul ignore if */
        // if (this.suiteTitle === 'Jasmine__TopLevel__Suite') {
        //     this.suiteTitle = test.fullName.slice(0, test.fullName.indexOf(test.description) - 1)
        // }
        // const fullTitle = (
        //     /**
        //      * Jasmine
        //      */
        //     test.fullName ||
        //     /**
        //      * Mocha
        //      */
        //     `${test.parent} - ${test.title}`
        // )
        // global.browser.execute('sauce:context=' + fullTitle)
    }
    afterSuite(suite) {
        log.info("Running the service afterSuite method");
        // if (Object.prototype.hasOwnProperty.call(suite, 'error')) {
        //     ++this.failures
        // }
    }
    afterTest(test, context, results) {
        log.info("Running the service afterTest method");
        /**
         * remove failure if test was retried and passed
         * > Mocha only
         */
        // if (test._retriedTest && results.passed) {
        //     --this.failures
        //     return
        // }
        /**
         * don't bump failure number if test was retried and still failed
         * > Mocha only
         */
        // if (test._retriedTest && !results.passed && test._currentRetry < test._retries) {
        //     return
        // }
        //
        // if (!results.passed) {
        //     ++this.failures
        // }
    }
    /**
     * For CucumberJS
     */
    beforeFeature(uri, feature) {
        log.info("Running the service beforeFeature method");
        /**
         * Date:    20200714
         * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
         */
        // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
        //     return
        // }
        //
        // this.suiteTitle = feature.document.feature.name
        // global.browser.execute('sauce:context=Feature: ' + this.suiteTitle)
    }
    beforeScenario(uri, feature, scenario) {
        log.info("Running the service beforeScenario method");
        /**
         * Date:    20200714
         * Remark:  Vitaq Unified Platform doesn't support updating the context yet.
         */
        // if (!this.isServiceEnabled || this.isRDC || this.isUP) {
        //     return
        // }
        //
        // const scenarioName = scenario.name
        // global.browser.execute('sauce:context=Scenario: ' + scenarioName)
    }
    afterScenario(uri, feature, pickle, result) {
        log.info("Running the service afterScenario method");
        // if (result.status === 'failed') {
        //     ++this.failures
        // }
    }
    /**
     * update Vitaq Labs job
     */
    after(result) {
        log.info("Running the service after method");
        // if (!this.isServiceEnabled && !this.isRDC) {
        //     return
        // }
        //
        // let failures = this.failures
        //
        // /**
        //  * set failures if user has bail option set in which case afterTest and
        //  * afterSuite aren't executed before after hook
        //  */
        // if (global.browser.config.mochaOpts && global.browser.config.mochaOpts.bail && Boolean(result)) {
        //     failures = 1
        // }
        //
        // const status = 'status: ' + (failures > 0 ? 'failing' : 'passing')
        // if (!global.browser.isMultiremote) {
        //     log.info(`Update job with sessionId ${global.browser.sessionId}, ${status}`)
        //     return this.isUP ? this.updateUP(failures) : this.updateJob(global.browser.sessionId, failures)
        // }
        //
        // return Promise.all(Object.keys(this.capabilities).map((browserName) => {
        //     log.info(`Update multiremote job for browser "${browserName}" and sessionId ${global.browser[browserName].sessionId}, ${status}`)
        //     return this.isUP ? this.updateUP(failures) : this.updateJob(global.browser[browserName].sessionId, failures, false, browserName)
        // }))
    }
    onReload(oldSessionId, newSessionId) {
        log.info("Running the service onReload method");
        // if (!this.isServiceEnabled && !this.isRDC) {
        //     return
        // }
        //
        // const status = 'status: ' + (this.failures > 0 ? 'failing' : 'passing')
        //
        // if (!global.browser.isMultiremote) {
        //     log.info(`Update (reloaded) job with sessionId ${oldSessionId}, ${status}`)
        //     return this.updateJob(oldSessionId, this.failures, true)
        // }
        //
        // const browserName = global.browser.instances.filter(
        //     (browserName) => global.browser[browserName].sessionId === newSessionId)[0]
        // log.info(`Update (reloaded) multiremote job for browser "${browserName}" and sessionId ${oldSessionId}, ${status}`)
        // return this.updateJob(oldSessionId, this.failures, true, browserName)
    }
    async updateJob(sessionId, failures, calledOnReload = false, browserName) {
        log.info("Running the service updateJob method");
        // if (this.isRDC) {
        //     await this.api.updateTest(sessionId, { passed: failures === 0 })
        //     this.failures = 0
        //     return
        // }
        //
        // const body = this.getBody(failures, calledOnReload, browserName)
        // await this.api.updateJob(this.config.user, sessionId, body)
        // this.failures = 0
    }
    /**
     * VM message data
     */
    getBody(failures, calledOnReload = false, browserName) {
        log.info("Running the service getBody method");
        // let body = {}
        //
        // /**
        //  * set default values
        //  */
        // body.name = this.suiteTitle
        //
        // if (browserName) {
        //     body.name = `${browserName}: ${body.name}`
        // }
        //
        // /**
        //  * add reload count to title if reload is used
        //  */
        // if (calledOnReload || this.testCnt) {
        //     let testCnt = ++this.testCnt
        //
        //     if (global.browser.isMultiremote) {
        //         testCnt = Math.ceil(testCnt / global.browser.instances.length)
        //     }
        //
        //     body.name += ` (${testCnt})`
        // }
        //
        // let caps = this.capabilities['sauce:options'] || this.capabilities
        //
        // for (let prop of jobDataProperties) {
        //     if (!caps[prop]) {
        //         continue
        //     }
        //
        //     body[prop] = caps[prop]
        // }
        //
        // body.passed = failures === 0
        // return body
    }
    /**
     * Update the UP with the JS-executor
     * @param {number} failures
     * @returns {*}
     */
    updateUP(failures) {
        log.info("Running the service updateUP method");
        // return global.browser.execute(`sauce:job-result=${failures === 0}`)
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxvQ0FBb0M7QUFDcEMsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsMkNBQTJDO0FBQzNDLDhDQUE4QztBQUU5QywrRUFBK0U7QUFFL0UsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFFekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLFlBQVk7SUFFL0IsWUFBWSxPQUFPO1FBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0M7UUFDckQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQsa0JBQWtCLENBQUMsS0FBSyxFQUFFLFlBQVk7UUFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM1RCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRTtZQUNyQyx3RkFBd0Y7WUFDeEYsR0FBRyxDQUFDLElBQUksQ0FBQyxrREFBa0QsRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUMxRSxHQUFHLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtB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