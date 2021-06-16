//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================

const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service')

// Packages
// @ts-ignore
import { VitaqAiApi } from 'vitaqai_api'

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
        try {
            log.debug("serviceOptions: ", serviceOptions);
            log.debug("capabilities: ", capabilities);
            log.debug("config: ", config);
            this._options = {...DEFAULT_OPTIONS, ...serviceOptions};
            // Import either the Sync or Async versions of the functions
            if (this._options.useSync) {
                // @ts-ignore
                this.vitaqFunctions = require('./functionsSync')
            } else {
                // @ts-ignore
                this.vitaqFunctions = require('./functionsAsync')
            }
            this._capabilities = capabilities;
            this._config = config;
            this._api = new VitaqAiApi(this._options)
            // @ts-ignore
            global.vitaq = this;
            this._counter = 0;
        } catch (error) {
            console.error("Error: Vitaq Service failed to initialise")
            console.error(error)
            throw new Error("Vitaq Service failed to initialise");
        }
    }

    async nextActionSelector(suite: MochaSuite, currentSuite: MochaSuite | undefined) {
        let nextAction: string;
        let result: boolean = true;
        let returnSuite: MochaSuite;
        if (typeof this._options.verbosityLevel !== 'undefined'
            && this._options.verbosityLevel > 50) {
            log.info("VitaqService: nextActionSelector: suite: ", suite)
        }

        // Keep for now - session start moved to beforeSesssion
        // // Check to see if the VitaqAI_API has established a Session with the Python job
        // if (this._api.sessionEstablished === "success") {
        //     // Do nothing and drop through to the next part of the code
        // } else if (this._api.sessionEstablished === "not_tried") {
        //     try {
        //         await this.waitForSession();
        //     } catch (error) {
        //         console.error("Error: ", error)
        //         return null
        //     }
        // } else if (this._api.sessionEstablished === "failed") {
        //     console.error("Error: Failed to establish session with Vitaq in the cloud")
        //     console.info("Info: Closing test because of error above")
        //     return null
        // } else if (this._api.sessionEstablished === "trying") {
        //     console.error("Error: Still trying to establish session with Vitaq in the cloud")
        //     console.info("Info: Closing test because of error above")
        //     return null
        // }

        // Get the result (pass/fail) off the _runnable
        if (typeof currentSuite !== "undefined") {
            // log.info("VitaqService: nextActionSelector: _runnable: ", currentSuite.ctx._runnable)
            // @ts-ignore
            if (typeof this._options.verbosityLevel !== 'undefined'
                && this._options.verbosityLevel > 50) {
                log.info("VitaqService: nextActionSelector: currentSuite: ", currentSuite)
                log.info("VitaqService: nextActionSelector: state: ", currentSuite.ctx._runnable.state);
            }
            // Map the passed/failed result to true and false
            if (currentSuite.ctx._runnable.state === "passed") {
                result = true;
            } else if (currentSuite.ctx._runnable.state === "failed") {
                result = false;
            } else {
                // Didn't get either passed or failed
                log.error('VitaqService: nextActionSelector: Unexpected value for state: ',
                    currentSuite.ctx._runnable.state)
                result
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
            } else {
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

    // -------------------------------------------------------------------------
    /**
     *
     * @param suite - The root suite that we will look through to find the sub-suite
     * @param suiteName - Name of the suite we are looking for
     * @returns {suite/null}
     */
    getSuite(suite: MochaSuite, suiteName: string) {
        for (let index = 0; index < suite.suites.length; index += 1) {
            const subSuite = suite.suites[index];
            if (subSuite.fullTitle() === suiteName) {
                return subSuite;
            }
        }
        console.error("Error: Was unable to find a test action script for: ", suiteName)
        console.warn(`Make sure you have a test file with ${suiteName} as the text in the describe block`)
        console.warn(`This will cause the test to end`)
        return null;
    }

    /**
     * Provide a simple sleep command
     * @param duration
     */
    sleep(ms: number) {
        // @ts-ignore
        return this.vitaqFunctions.sleep(ms, this._browser)
    }

    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHODS
    // -------------------------------------------------------------------------
    /**
     * Get Vitaq to generate a new value for the variable and then get it
     * @param variableName - name of the variable
     */
    requestData(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.requestData(variableName, this._browser, this._api)
    }

    /**
     * Get Vitaq to record coverage for the variables in the array
     * @param variablesArray - array of variables to record coverage for
     */
    recordCoverage(variablesArray: []) {
        // @ts-ignore
        return this.vitaqFunctions.recordCoverage(variablesArray, this._browser, this._api)
    }

    /**
     * Send data to Vitaq and record it on the named variable
     * @param variableName - name of the variable
     * @param value - value to store
     */
    sendDataToVitaq(variableName: string, value: any) {
        // @ts-ignore
        return this.vitaqFunctions.sendDataToVitaq(variableName, value, this._browser, this._api)
    }

    /**
     * Read data from a variable in Vitaq
     * @param variableName - name of the variable to read
     */
    readDataFromVitaq(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.readDataFromVitaq(variableName, this._browser, this._api)
    }

    /**
     * Create an entry in the Vitaq log
     * @param message - message/data to put into the log
     * @param format - format of the message/data, can be "text" (default) or "json"
     *
     * When using the JSON option the JSON data needs to be stringified using the
     * JSON.stringify() method
     */
    createVitaqLogEntry(message: string | {}, format: string) {
        // @ts-ignore
        return this.vitaqFunctions.createVitaqLogEntry(message, format, this._browser, this._api)
    }

    // -------------------------------------------------------------------------
    // VITAQ CONTROL METHOD ALIASES
    // -------------------------------------------------------------------------
    // Easier names to use with the Vitaq control methods

    // recordCoverage
    record(variablesArray: []) {
        return this.recordCoverage(variablesArray)
    }

    // sendDataToVitaq
    writeDataToVitaq(variableName: string, value: any) {
        return this.sendDataToVitaq(variableName, value)
    }

    write(variableName: string, value: any) {
        return this.sendDataToVitaq(variableName, value)
    }

    // readDataFromVitaq
    read(variableName: string) {
        return this.readDataFromVitaq(variableName)
    }

    // createVitaqLogEntry
    log(message: string | {}, format: string) {
        return this.createVitaqLogEntry(message, format)
    }

// =============================================================================
// Action Methods
// =============================================================================

    abort(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.abort(actionName, this._browser, this._api)
    }

    addNext(actionName: string, nextAction: string, weight: number = 1) {
        // @ts-ignore
        return this.vitaqFunctions.addNext(actionName, nextAction, weight, this._browser, this._api)
    }

    clearCallCount(actionName: string, tree: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.clearCallCount(actionName, tree, this._browser, this._api)
    }

    displayNextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.displayNextActions(actionName, this._browser, this._api)
    }

    getCallCount(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getCallCount(actionName, this._browser, this._api)
    }

    getCallLimit(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getCallLimit(actionName, this._browser, this._api)
    }

    getEnabled(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getEnabled(actionName, this._browser, this._api)
    }

    getPrevious(actionName: string, steps: number = 1) {
        // @ts-ignore
        return this.vitaqFunctions.getPrevious(actionName, steps, this._browser, this._api)
    }

    getId(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getId(actionName, this._browser, this._api)
    }

    nextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.nextActions(actionName, this._browser, this._api)
    }

    numberActiveNextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.numberActiveNextActions(actionName, this._browser, this._api)
    }

    numberNextActions(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.numberNextActions(actionName, this._browser, this._api)
    }

    removeAllNext(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.removeAllNext(actionName, this._browser, this._api)
    }

    removeFromCallers(actionName: string) {
        // @ts-ignore
        return this.vitaqFunctions.removeFromCallers(actionName, this._browser, this._api)
    }

    removeNext(actionName: string, nextAction: string) {
        // @ts-ignore
        return this.vitaqFunctions.removeNext(actionName, nextAction, this._browser, this._api)
    }

    setCallLimit(actionName: string, limit: number) {
        // @ts-ignore
        return this.vitaqFunctions.setCallLimit(actionName, limit, this._browser, this._api)
    }

    setEnabled(actionName: string, enabled: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.setEnabled(actionName, enabled, this._browser, this._api)
    }

    setExhaustive(actionName: string, exhaustive: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.setExhaustive(actionName, exhaustive, this._browser, this._api)
    }

    setMaxActionDepth(actionName: string, depth: number = 1000) {
        // @ts-ignore
        return this.vitaqFunctions.setMaxActionDepth(actionName, depth, this._browser, this._api)
    }

// =============================================================================
// Data Methods
// =============================================================================

    allowList(variableName: string, list: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowList(variableName, list, this._browser, this._api)
    }

    allowOnlyList(variableName: string, list: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyList(variableName, list, this._browser, this._api)
    }

    allowOnlyRange(variableName: string, low: number, high: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyRange(variableName, low, high, this._browser, this._api)
    }

    allowOnlyValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyValue(variableName, value, this._browser, this._api)
    }

    allowOnlyValues(variableName: string, valueList: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowOnlyValues(variableName, valueList, this._browser, this._api)
    }

    allowRange(variableName: string, low: number, high: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowRange(variableName, low, high, this._browser, this._api)
    }

    allowValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.allowValue(variableName, value, this._browser, this._api)
    }

    allowValues(variableName: string, valueList: []) {
        // @ts-ignore
        return this.vitaqFunctions.allowValues(variableName, valueList, this._browser, this._api)
    }

    disallowRange(variableName: string, low: number, high: number) {
        // @ts-ignore
        return this.vitaqFunctions.disallowRange(variableName, low, high, this._browser, this._api)
    }

    disallowValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.disallowValue(variableName, value, this._browser, this._api)
    }

    disallowValues(variableName: string, valueList: []) {
        // @ts-ignore
        return this.vitaqFunctions.disallowValues(variableName, valueList, this._browser, this._api)
    }

    doNotRepeat(variableName: string, value: boolean) {
        // @ts-ignore
        return this.vitaqFunctions.doNotRepeat(variableName, value, this._browser, this._api)
    }

    gen(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.gen(variableName, this._browser, this._api)
    }

    getDoNotRepeat(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getDoNotRepeat(variableName, this._browser, this._api)
    }

    getSeed(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getSeed(variableName, this._browser, this._api)
    }

    getValue(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.getValue(variableName, this._browser, this._api)
    }

    resetRanges(variableName: string) {
        // @ts-ignore
        return this.vitaqFunctions.resetRanges(variableName, this._browser, this._api)
    }

    setSeed(variableName: string, seed: number) {
        // @ts-ignore
        return this.vitaqFunctions.setSeed(variableName, seed, this._browser, this._api)
    }

    setValue(variableName: string, value: number) {
        // @ts-ignore
        return this.vitaqFunctions.setValue(variableName, value, this._browser, this._api)
    }

    // =========================================================================
    // =========================================================================
    onPrepare(config:any, capabilities:any) {
        // Not seen
        log.info("Running the vitaq-service onPrepare method");
    }

    onWorkerStart(cid:any, caps:any, specs:any, args:any, execArgv:any) {
        // Not seen
        log.info("Running the vitaq-service onWorkerStart method");
    }

    async beforeSession (config: Options.Testrunner, capabilities: Capabilities.RemoteCapability) {
        // Runs
        log.info("Running the vitaq-service beforeSession method")

        // Run up the Vitaq session
        try {
            await this.waitForSession();
        } catch (error) {
            console.error("Error: ", error)
        }
    }

    // https://github.com/webdriverio/webdriverio/blob/master/examples/wdio.conf.js#L183-L326
    // before: function (capabilities, specs, browser) {
    before(config: unknown, capabilities: unknown, browser: Browser<'async'> | MultiRemoteBrowser<'async'>) {
        // Runs
        this._browser = browser
        log.info("Running the vitaq-service before method")
    }

    beforeSuite(suite: Frameworks.Suite) {
        // Runs
        log.info("Running the vitaq-service beforeSuite method")
    }

    beforeHook(test:any, context:any, stepData:any, world:any) {
        // Not seen
        log.info("Running the vitaq-service beforeHook method");
    }

    afterHook(test: never, context: never, results: Frameworks.TestResult){
        // Not seen
        log.info("Running the vitaq-service afterHook method")
    }

    beforeTest(test: Frameworks.Test, context:any) {
        // Runs
        log.info("Running the vitaq-service beforeTest method")
    }

    beforeCommand(commandName:any, args:any) {
        // Runs
        log.info("Running the vitaq-service beforeCommand method")
    }

    afterCommand(commandName:any, args:any, result:any, error:any) {
        // Runs
        log.info("Running the vitaq-service afterCommand method")
    }

    afterTest(test: Frameworks.Test, context: unknown, results: Frameworks.TestResult) {
        // Runs
        log.info("Running the vitaq-service afterTest method")
    }

    afterSuite(suite: Frameworks.Suite) {
        // Runs
        log.info("Running the vitaq-service afterSuite method")
    }

    after(result: number) {
        // Runs
        log.info("Running the vitaq-service after method")
    }

    afterSession(config: Options.Testrunner, capabilities: Capabilities.RemoteCapability, specs:any) {
        // Runs
        log.info("Running the vitaq-service afterSession method")
    }

    onComplete(exitCode:any, config:any, capabilities:any, results:any) {
        // Runs the launcher onComplete method - not this one!!
        log.info("Running the vitaq-service onComplete method")
    }

    onReload(oldSessionId:any, newSessionId:any) {
        log.info("Running the vitaq-service onReload method")
    }

    // -------------------------------------------------------------------------
    /**
     * waitForSession - Wait for an established session with the Python job
     * @param delay - delay in checking
     * @param timeout - timeout
     */
    waitForSession(delay=100, timeout=20000) {
        return new Promise((resolve, reject) => {
            let timeoutCounter = 0;
            let intervalId = setInterval( async () => {

                // Increment the timeoutCounter for a crude timeout
                timeoutCounter += delay;
                // console.log('VitaqAiApi: waitForNextAction: this.nextTestAction: ', this.nextTestAction)

                if (this._api.sessionEstablished === "not_tried") {
                    await this._api.startPython()
                } else if (this._api.sessionEstablished === "success") {
                    clearInterval(intervalId)
                    resolve(this._api.sessionEstablished)
                } else if (this._api.sessionEstablished === "failed") {
                    clearInterval(intervalId)
                    reject(this._api.sessionEstablished)
                } else if (timeoutCounter > timeout) {
                    console.error('service: waitForSession: Did not establish session in timeout period')
                    clearInterval(intervalId)
                    reject("Timed Out")
                }
            }, delay)
        });
    }

    // // Cucumber specific hooks
    // // ======================================================================
    // beforeFeature: function (uri, feature, scenarios) {}
    // beforeScenario: function (uri, feature, scenario, sourceLocation) {}
    // beforeStep: function ({ uri, feature, step }, context) {}
    // afterStep: function ({ uri, feature, step }, context, { error, result, duration, passed, retries }) {}
    // afterScenario: function (uri, feature, scenario, result, sourceLocation) {}
    // afterFeature: function (uri, feature, scenarios) {}

}

// =============================================================================
// END OF FILE
// =============================================================================
