"use strict";
// import { performance, PerformanceObserver } from 'perf_hooks'
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@wdio/logger"));
// import VitaqLabs from 'saucelabs'
// import { makeCapabilityFactory } from './utils.js'
//
// const SC_RELAY_DEPCRECATION_WARNING = [
//     'The "scRelay" option is depcrecated and will be removed',
//     'with the upcoming versions of @wdio/sauce-service. Please',
//     'remove the option as tests should work identically without it.'
// ].join(' ')
// const MAX_SC_START_TRIALS = 3
const log = logger_1.default('@wdio/vitaq-service');
class VitaqLauncher {
    constructor(options, capabilities, config) {
        this.options = options;
        // this.api = new VitaqLabs(config)
    }
    /**
     * modify config and launch sauce connect
     */
    async onPrepare(config, capabilities) {
        log.info("Running the launcher onPrepare method");
        // if (!this.options.sauceConnect) {
        //     return
        // }
        //
        // const sauceConnectOpts = this.options.sauceConnectOpts || {}
        // const sauceConnectTunnelIdentifier = (
        //     sauceConnectOpts.tunnelIdentifier ||
        //     /**
        //      * generate random identifier if not provided
        //      */
        //     `SC-tunnel-${Math.random().toString().slice(2)}`)
        //
        // this.sauceConnectOpts = {
        //     noAutodetect: true,
        //     tunnelIdentifier: sauceConnectTunnelIdentifier,
        //     ...sauceConnectOpts
        // }
        //
        // let endpointConfigurations = {}
        // if (this.options.scRelay) {
        //     log.warn(SC_RELAY_DEPCRECATION_WARNING)
        //
        //     const scRelayPort = this.sauceConnectOpts.port || 4445
        //     this.sauceConnectOpts.sePort = scRelayPort
        //     endpointConfigurations = {
        //         protocol: 'http',
        //         hostname: 'localhost',
        //         port: scRelayPort
        //     }
        // }
        //
        // const prepareCapability = makeCapabilityFactory(sauceConnectTunnelIdentifier, endpointConfigurations)
        // if (Array.isArray(capabilities)) {
        //     for (const capability of capabilities) {
        //         prepareCapability(capability)
        //     }
        // } else {
        //     for (const browserName of Object.keys(capabilities)) {
        //         prepareCapability(capabilities[browserName].capabilities)
        //     }
        // }
        /**
         * measure SC boot time
         */
        // const obs = new PerformanceObserver((list) => {
        //     const entry = list.getEntries()[0]
        //     log.info(`Vitaq Connect successfully started after ${entry.duration}ms`)
        // })
        // obs.observe({ entryTypes: ['measure'], buffered: false })
        //
        // performance.mark('sauceConnectStart')
        // this.sauceConnectProcess = await this.startTunnel()
        // performance.mark('sauceConnectEnd')
        // performance.measure('bootTime', 'sauceConnectStart', 'sauceConnectEnd')
    }
    async startTunnel(retryCount = 0) {
        log.info("Running the launcher startTunnel method");
        // try {
        //     const scProcess = await this.api.startVitaqConnect(this.sauceConnectOpts)
        //     return scProcess
        // } catch (err) {
        //     ++retryCount
        //     /**
        //      * fail starting Vitaq Connect eventually
        //      */
        //     if (
        //         /**
        //          * only fail for ENOENT errors due to racing condition
        //          * see: https://github.com/saucelabs/node-saucelabs/issues/86
        //          */
        //         !err.message.includes('ENOENT') ||
        //         /**
        //          * or if we reached the maximum rety count
        //          */
        //         retryCount >= MAX_SC_START_TRIALS
        //     ) {
        //         throw err
        //     }
        //     log.debug(`Failed to start Vitaq Connect Proxy due to ${err.stack}`)
        //     log.debug(`Retrying ${retryCount}/${MAX_SC_START_TRIALS}`)
        //     return this.startTunnel(retryCount)
        // }
    }
    /**
     * shut down
     */
    onComplete() {
        log.info("Running the launcher onComplete method");
        // if (!this.sauceConnectProcess) {
        //     return
        // }
        //
        // return this.sauceConnectProcess.close()
    }
}
exports.default = VitaqLauncher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF1bmNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdFQUFnRTs7Ozs7QUFFaEUsMERBQWlDO0FBQ2pDLG9DQUFvQztBQUVwQyxxREFBcUQ7QUFDckQsRUFBRTtBQUNGLDBDQUEwQztBQUMxQyxpRUFBaUU7QUFDakUsbUVBQW1FO0FBQ25FLHVFQUF1RTtBQUN2RSxjQUFjO0FBQ2QsZ0NBQWdDO0FBRWhDLE1BQU0sR0FBRyxHQUFHLGdCQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUN6QyxNQUFxQixhQUFhO0lBQzlCLFlBQWEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLG1DQUFtQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFFLE1BQU0sRUFBRSxZQUFZO1FBQ2pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQTtRQUNqRCxvQ0FBb0M7UUFDcEMsYUFBYTtRQUNiLElBQUk7UUFDSixFQUFFO1FBQ0YsK0RBQStEO1FBQy9ELHlDQUF5QztRQUN6QywyQ0FBMkM7UUFDM0MsVUFBVTtRQUNWLG9EQUFvRDtRQUNwRCxVQUFVO1FBQ1Ysd0RBQXdEO1FBQ3hELEVBQUU7UUFDRiw0QkFBNEI7UUFDNUIsMEJBQTBCO1FBQzFCLHNEQUFzRDtRQUN0RCwwQkFBMEI7UUFDMUIsSUFBSTtRQUNKLEVBQUU7UUFDRixrQ0FBa0M7UUFDbEMsOEJBQThCO1FBQzlCLDhDQUE4QztRQUM5QyxFQUFFO1FBQ0YsNkRBQTZEO1FBQzdELGlEQUFpRDtRQUNqRCxpQ0FBaUM7UUFDakMsNEJBQTRCO1FBQzVCLGlDQUFpQztRQUNqQyw0QkFBNEI7UUFDNUIsUUFBUTtRQUNSLElBQUk7UUFDSixFQUFFO1FBQ0Ysd0dBQXdHO1FBRXhHLHFDQUFxQztRQUNyQywrQ0FBK0M7UUFDL0Msd0NBQXdDO1FBQ3hDLFFBQVE7UUFDUixXQUFXO1FBQ1gsNkRBQTZEO1FBQzdELG9FQUFvRTtRQUNwRSxRQUFRO1FBQ1IsSUFBSTtRQUVKOztXQUVHO1FBQ0gsa0RBQWtEO1FBQ2xELHlDQUF5QztRQUN6QywrRUFBK0U7UUFDL0UsS0FBSztRQUNMLDREQUE0RDtRQUM1RCxFQUFFO1FBQ0Ysd0NBQXdDO1FBQ3hDLHNEQUFzRDtRQUN0RCxzQ0FBc0M7UUFDdEMsMEVBQTBFO0lBQzlFLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsQ0FBQTtRQUNuRCxRQUFRO1FBQ1IsZ0ZBQWdGO1FBQ2hGLHVCQUF1QjtRQUN2QixrQkFBa0I7UUFDbEIsbUJBQW1CO1FBQ25CLFVBQVU7UUFDVixnREFBZ0Q7UUFDaEQsVUFBVTtRQUNWLFdBQVc7UUFDWCxjQUFjO1FBQ2QsaUVBQWlFO1FBQ2pFLHdFQUF3RTtRQUN4RSxjQUFjO1FBQ2QsNkNBQTZDO1FBQzdDLGNBQWM7UUFDZCxxREFBcUQ7UUFDckQsY0FBYztRQUNkLDRDQUE0QztRQUM1QyxVQUFVO1FBQ1Ysb0JBQW9CO1FBQ3BCLFFBQVE7UUFDUiwyRUFBMkU7UUFDM0UsaUVBQWlFO1FBQ2pFLDBDQUEwQztRQUMxQyxJQUFJO0lBQ1IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsVUFBVTtRQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtRQUNsRCxtQ0FBbUM7UUFDbkMsYUFBYTtRQUNiLElBQUk7UUFDSixFQUFFO1FBQ0YsMENBQTBDO0lBQzlDLENBQUM7Q0FDSjtBQTdHRCxnQ0E2R0MifQ==