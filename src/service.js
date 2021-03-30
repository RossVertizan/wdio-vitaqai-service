// import VitaqLabs from 'saucelabs'
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
console.log("This is logger: ", logger);
// import { isUnifiedPlatform } from './utils'

// const jobDataProperties = ['name', 'tags', 'public', 'build', 'custom-data']

const log = logger('@wdio/vitaq-service')
const Rectangle = require('../../../vitaq_spoof').Rectangle

module.exports = class VitaqService {
    constructor (options) {
        this.testCnt = 0
        this.failures = 0 // counts failures between reloads
        this.options = options || {}
        global.rectangle = new Rectangle(34, 95)
        console.log('VitaqService: global: ', global)
        global.vitaq = this;
        this.counter= 0;
    }
    nextActionSelector(suite, currentSuite) {
        // log.info("VitaqService: nextAction: context: ", currentSuite.ctx)
        if (typeof currentSuite.ctx !== "undefined") {
            // log.info("VitaqService: nextAction: _runnable: ", currentSuite.ctx._runnable)
            log.info("VitaqService: nextAction: state: ", currentSuite.ctx._runnable.state)
        }

        if (suite.root) {
            if (currentSuite === -1) {
                this.counter += 1;
                return this.getSuite(suite, "Suite3");
            }
            else if (this.counter < 3) {
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
    beforeSession (config, capabilities) {
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

    before() {
        log.info("Running the service before method")
        // Ensure capabilities are not null in case of multiremote
        // const capabilities = global.browser.capabilities || {}
        // this.isUP = isUnifiedPlatform(capabilities)
    }

    beforeSuite (suite) {
        log.info("Running the service beforeSuite method")
        // this.suiteTitle = suite.title
        // if (this.options.setJobNameInBeforeSuite && !this.isUP) {
        //     global.browser.execute('sauce:job-name=' + this.suiteTitle)
        // }
    }

    beforeTest (test) {
        log.info("Running the service beforeSession method")
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

    afterSuite (suite) {
        log.info("Running the service afterSuite method")
        // if (Object.prototype.hasOwnProperty.call(suite, 'error')) {
        //     ++this.failures
        // }
    }

    afterTest (test, context, results) {
        log.info("Running the service afterTest method")
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
    beforeFeature (uri, feature) {
        log.info("Running the service beforeFeature method")
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

    beforeScenario (uri, feature, scenario) {
        log.info("Running the service beforeScenario method")
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
        log.info("Running the service afterScenario method")
        // if (result.status === 'failed') {
        //     ++this.failures
        // }
    }

    /**
     * update Vitaq Labs job
     */
    after (result) {
        log.info("Running the service after method")
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

    onReload (oldSessionId, newSessionId) {
        log.info("Running the service onReload method")
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

    async updateJob (sessionId, failures, calledOnReload = false, browserName) {
        log.info("Running the service updateJob method")
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
    getBody (failures, calledOnReload = false, browserName) {
        log.info("Running the service getBody method")
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
    updateUP(failures){
        log.info("Running the service updateUP method")
        // return global.browser.execute(`sauce:job-result=${failures === 0}`)
    }
}
