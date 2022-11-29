"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    onPrepare(config, capabilities) {
        return __awaiter(this, void 0, void 0, function* () {
            log.debug("Running the vitaq-service onPrepare method");
            log.debug("config.specs: ", config.specs);
            // eslint-disable-next-line @typescript-eslint/no-inferrable-types
            let everythingOK = true;
            // ==== Check the specs in the config ====
            // Check to see if the specs have been grouped
            // Expect a single group, so specs with a length of 1
            // and the single spec entry is itself an array with 1 or more entries
            // eslint-disable-next-line @typescript-eslint/no-inferrable-types
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
            // eslint-disable-next-line @typescript-eslint/no-inferrable-types
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
        });
    }
}
exports.default = VitaqLauncher;
// =============================================================================
// END OF FILE
// =============================================================================
