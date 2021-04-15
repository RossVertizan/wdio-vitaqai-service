"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service');
const constants_1 = require("./constants");
module.exports = class VitaqService {
    constructor(serviceOptions, capabilities, config) {
        log.debug("serviceOptions: ", serviceOptions);
        log.debug("capabilities: ", capabilities);
        log.debug("config: ", config);
        this._options = { ...constants_1.DEFAULT_OPTIONS, ...serviceOptions };
        this._capabilities = capabilities;
        this._config = config;
        // @ts-ignore
        global.vitaq = this;
        this._counter = 0;
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
                this._counter += 1;
                return this.getSuite(suite, "Suite3");
            }
            else if (currentSuite.title === 'Suite3') {
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
                log.info("VitaqService: nextActionSelector: counter: ", this._counter);
                this._counter += 1;
                return this.getSuite(suite, "Suite2");
            }
            else if (currentSuite.title === 'Suite2') {
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
                log.info("VitaqService: nextActionSelector: counter: ", this._counter);
                this._counter += 1;
                return this.getSuite(suite, "Suite1");
            }
            else if (currentSuite.title === 'Suite1' && this._counter < 10) {
                log.info("VitaqService: nextActionSelector: currentSuite is: ", currentSuite);
                log.info("VitaqService: nextActionSelector: counter: ", this._counter);
                this._counter += 1;
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFRekMsMkNBQTZDO0FBRTdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxZQUFZO0lBTS9CLFlBQ0ksY0FBa0MsRUFDbEMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLDJCQUFlLEVBQUUsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixhQUFhO1FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsWUFBd0I7UUFDMUQsR0FBRyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM1RCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRTtZQUNyQyx3RkFBd0Y7WUFDeEYsR0FBRyxDQUFDLElBQUksQ0FBQyxrREFBa0QsRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUMxRSxHQUFH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