"use strict";
//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@wdio/logger"));
const log = logger_1.default('@wdio/vitaq-service');
class VitaqLauncher {
    constructor(options, capabilities, config) {
        this.options = options;
    }
    /**
     * modify config and launch sauce connect
     */
    async onPrepare(config, capabilities) {
        log.info("Running the launcher onPrepare method");
    }
    async startTunnel(retryCount = 0) {
        log.info("Running the launcher startTunnel method");
    }
    /**
     * shut down
     */
    onComplete() {
        log.info("Running the launcher onComplete method");
    }
}
exports.default = VitaqLauncher;
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF1bmNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGOzs7OztBQUVoRiwwREFBaUM7QUFFakMsTUFBTSxHQUFHLEdBQUcsZ0JBQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQXFCLGFBQWE7SUFDOUIsWUFBYSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU07UUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBRSxNQUFNLEVBQUUsWUFBWTtRQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUE7SUFDckQsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLENBQUM7UUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVU7UUFDTixHQUFHLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUE7SUFDdEQsQ0FBQztDQUNKO0FBdEJELGdDQXNCQztBQUVELGdGQUFnRjtBQUNoRixjQUFjO0FBQ2QsZ0ZBQWdGIn0=