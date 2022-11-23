"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//==============================================================================
// (c) Vertizan Limited 2020-2021
//==============================================================================
const logger_1 = __importDefault(require("@wdio/logger"));
// Packages
const webdriverio_1 = require("webdriverio");
const log = (0, logger_1.default)('wdio-vitaqai-service');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF1bmNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnRkFBZ0Y7QUFDaEYsaUNBQWlDO0FBQ2pDLGdGQUFnRjtBQUNoRiwwREFBaUM7QUFFakMsV0FBVztBQUNYLDZDQUFnRDtBQWFoRCxNQUFNLEdBQUcsR0FBRyxJQUFBLGdCQUFNLEVBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUUxQyxNQUFxQixhQUFhO0lBSzlCLFlBQ0ksT0FBNEIsRUFDNUIsWUFBMkMsRUFDM0MsTUFBcUI7UUFFckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7UUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUE7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7SUFDekIsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUUsTUFBcUIsRUFBRSxZQUFxQjtRQUN6RCxHQUFHLENBQUMsS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUE7UUFDdkQsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDekMsSUFBSSxZQUFZLEdBQVksSUFBSSxDQUFBO1FBRWhDLDBDQUEwQztRQUMxQyw4Q0FBOEM7UUFDOUMscURBQXFEO1FBQ3JELHNFQUFzRTtRQUN0RSxJQUFJLGFBQWEsR0FBWSxJQUFJLENBQUM7UUFDbEMsSUFBSSxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO1lBQ3JDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNoQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxH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