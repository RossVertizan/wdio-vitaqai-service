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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFFekMsV0FBVztBQUNYLGFBQWE7QUFDYiw4REFBb0M7QUFRcEMsMkNBQTZDO0FBRTdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxZQUFZO0lBUS9CLFlBQ0ksY0FBbUMsRUFDbkMsWUFBMkMsRUFDM0MsTUFBMEI7UUFFMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLDJCQUFlLEVBQUUsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkscUJBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUN2QixhQUFhO1FBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLFlBQW9DO1FBQzVFLElBQUks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