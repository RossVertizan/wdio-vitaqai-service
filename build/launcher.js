"use strict";
//==============================================================================
// (c) Vertizan Limited 2020-2021
//==============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@wdio/logger"));
const log = (0, logger_1.default)('wdio-vitaqai-service');
// Packages
const webdriverio_1 = require("webdriverio");
// Have no need for this file at the moment, but keep it available.
class VitaqLauncher {
    constructor(options, capabilities, config) {
        this._options = options;
        this._capabilities = capabilities;
        this._config = config;
    }
    async onPrepare(config, capabilities) {
        log.debug("Running the vitaq-service onPrepare method");
        log.debug("config.specs: ", config.specs);
        let everythingOK = true;
        // ==== Check the specs in the config ====
        // Check to see if the specs have been grouped
        // Expect a single group, so specs with a length of 1
        // and the single spec entry is itself an array with 1 or more entries
        let specsLookGood = true;
        if (typeof config.specs !== "undefined") {
            if (config.specs.length === 1) {
                if (Array.isArray(config.specs[0])) {
                    if (config.specs[0].length > 0) {
                        log.debug("Specs look good: ", config.specs);
                    }
                    else {
                        // first element in specs has a length of zero
                        log.error("First element in specs has no entries");
                        specsLookGood = false;
                    }
                }
                else {
                    // first element in specs is not an array
                    log.error("First element in specs is not grouped - use square brackets");
                    specsLookGood = false;
                }
            }
            else {
                // specs do not have a length of 1
                log.error("Expected specs to have a single group");
                specsLookGood = false;
            }
        }
        else {
            // specs are undefined
            log.error("Please check that you have defined test specifications/scripts in the specs section of the wdio.conf file");
        }
        if (!specsLookGood) {
            log.error("Vitaq requires that you group test specifications/scripts in the specs section of the wdio.conf file");
            log.error("This is done by enclosing the test specifications/scripts within square brackets");
            log.error("The specs section should look something like: 'specs: [ ['./test/actions/*.js'] ]");
            everythingOK = false;
        }
        // ==== Check the options for required fields ====
        let optionsLookGood = true;
        if (typeof this._options.userName === "undefined") {
            log.error("userName is not defined in the vitaqai options");
            log.error("userName is the e-mail address used for your VitaqAI account");
            optionsLookGood = false;
        }
        if (typeof this._options.projectName === "undefined") {
            log.error("projectName is not defined in the vitaqai options");
            log.error("projectName is the name of the project which contains the test activity");
            optionsLookGood = false;
        }
        if (typeof this._options.testActivityName === "undefined") {
            log.error("testActivityName is not defined in the vitaqai options");
            log.error("testActivityName is the name of the test activity you wish to test");
            optionsLookGood = false;
        }
        if (typeof this._options.userAPIKey === "undefined") {
            log.error("userAPIKey is not defined in the vitaqai options");
            log.error("You can get this by logging into your account at https://vitaq.online and in the top right corner choosing <user>->Get API Key");
            optionsLookGood = false;
        }
        if (!optionsLookGood) {
            log.error("Vitaq requires that you specify some options in the services section of the wdio.conf file");
            everythingOK = false;
        }
        // ==== Check the framework in the config ====
        if (config.framework !== "vitaqai-mocha") {
            log.error(`Incorrect framework specified, expected vitaqai-mocha but got ${config.framework}`);
            log.error("Vitaq uses a modified version of the Mocha testing framework");
            log.error("You need to install this modified framework and specify it in the framework section of the wdio.conf file");
            everythingOK = false;
        }
        // Throw SevereServiceError is we detected any issues
        if (!everythingOK) {
            log.error("For more information see: https://vitaq.online/documentation/gettingStarted#setting-up-webdriverio");
            throw new webdriverio_1.SevereServiceError('Errors detected in the configuration for running Vitaq');
        }
    }
}
exports.default = VitaqLauncher;
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF1bmNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGOzs7OztBQUVoRiwwREFBaUM7QUFDakMsTUFBTSxHQUFHLEdBQUcsSUFBQSxnQkFBTSxFQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFMUMsV0FBVztBQUNYLDZDQUFnRDtBQWFoRCxtRUFBbUU7QUFDbkUsTUFBcUIsYUFBYTtJQUs5QixZQUNJLE9BQTRCLEVBQzVCLFlBQTJDLEVBQzNDLE1BQXFCO1FBRXJCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFBO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBO0lBQ3pCLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFFLE1BQXFCLEVBQUUsWUFBcUI7UUFDekQsR0FBRyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO1FBQ3ZELEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3pDLElBQUksWUFBWSxHQUFZLElBQUksQ0FBQTtRQUVoQywwQ0FBMEM7UUFDMUMsOENBQThDO1FBQzlDLHFEQUFxRDtRQUNyRCxzRUFBc0U7UUFDdEUsSUFBSSxhQUFhLEdBQVksSUFBSSxDQUFDO1FBQ2xDLElBQUksT0FBTyxNQUFNLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRTtZQUNyQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDaEMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FB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