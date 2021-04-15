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
    nextActionSelector(suite, currentSuite) {
        let nextAction;
        log.info("VitaqService: nextActionSelector: suite: ", suite);
        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite);
            log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
            // Map the passed/failed result to true and false
            let result;
            if (currentSuite.ctx._runnable.state === "passed") {
                result = true;
            }
            else if (currentSuite.ctx._runnable.state === "failed") {
                result = false;
            }
            else {
                // Didn't get either passed or failed
                log.error('VitaqService: nextActionSelector: Unexpected value for state: ', currentSuite.ctx._runnable.state);
            }
        }
        // Send the result and get the next action
        if (suite.root) {
            log.info("VitaqService: nextActionSelector: This is the root suite");
            if (typeof currentSuite === "undefined") {
                log.info("VitaqService: nextActionSelector: currentSuite is undefined");
                // @ts-ignore
                nextAction = global.browser.call(() => this._api.getNextTestActionCaller(undefined, true));
            }
            else {
                // @ts-ignore
                nextAction = global.browser.call(() => this._api.getNextTestActionCaller(currentSuite.title, true));
            }
            log.info("VitaqService: nextActionSelector: Returning nextAction: ", nextAction);
            return nextAction;
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
    before(config, capabilities, browser) {
        this._browser = browser;
        log.info("Running the service before method");
        // Ensure capabilities are not null in case of multiremote
        // const capabilities = global.browser.capabilities || {}
        // this.isUP = isUnifiedPlatform(capabilities)
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFFekMsV0FBVztBQUNYLGFBQWE7QUFDYiw4REFBb0M7QUFRcEMsMkNBQTZDO0FBRTdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxZQUFZO0lBUS9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLDJCQUFlLEVBQUUsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkscUJBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUN2QixhQUFhO1FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsWUFBb0M7UUFDdEUsSUFBSSxVQUFrQixDQUFD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