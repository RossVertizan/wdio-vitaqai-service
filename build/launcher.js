"use strict";
//==============================================================================
// (c) Vertizan Limited 2020-2021
//==============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@wdio/logger"));
const log = logger_1.default('@wdio/vitaq-service');
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
            log.error("For more information see: https://vitaq.online/documentation/gettingStarted#setting-up-webdriverio");
            throw new webdriverio_1.SevereServiceError('Specs are not grouped');
        }
    }
}
exports.default = VitaqLauncher;
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF1bmNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGOzs7OztBQUVoRiwwREFBaUM7QUFDakMsTUFBTSxHQUFHLEdBQUcsZ0JBQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBRXpDLFdBQVc7QUFDWCw2Q0FBZ0Q7QUFhaEQsbUVBQW1FO0FBQ25FLE1BQXFCLGFBQWE7SUFLOUIsWUFDSSxPQUE0QixFQUM1QixZQUEyQyxFQUMzQyxNQUFxQjtRQUVyQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtRQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQTtRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtJQUN6QixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBRSxNQUFxQixFQUFFLFlBQXFCO1FBQ3pELEdBQUcsQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQTtRQUN2RCxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN6Qyw4Q0FBOEM7UUFDOUMscURBQXFEO1FBQ3JELHNFQUFzRTtRQUN0RSxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO1lBQ3JDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNoQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDNUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ2hEO3lCQUNJO3dCQUNELDhDQUE4Qzt3QkFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO3dCQUNuRCxhQUFhLEdBQUcsS0FBSyxDQUFDO3FCQUN6QjtpQkFDSjtxQkFDSTtvQkFDRCx5Q0FBeUM7b0JBQ3pDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztvQkFDekUsYUFBYSxHQUFHLEtBQUssQ0FBQztpQkFDekI7YUFDSjtpQkFDSTtnQkFDRCxrQ0FBa0M7Z0JBQ2xDLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztnQkFDbkQsYUFBYSxHQUFHLEtBQUssQ0FBQzthQUN6QjtTQUNKO2FBQ0k7WUFDRCxzQkFBc0I7WUFDdEIsR0FBRyxDQUFDLEtBQUssQ0FBQywyR0FBMkcsQ0FBQyxDQUFDO1NBQzFIO1FBQ0QsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixHQUFHLENBQUMsS0FBSyxDQUFDLHNHQUFzRyxDQUFDLENBQUM7WUFDbEgsR0FBRyxDQUFDLEtBQUssQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO1lBQzlGLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUZBQW1GLENBQUMsQ0FBQztZQUMvRixHQUFHLENBQUMsS0FBSyxDQUFDLG9HQUFvRyxDQUFDLENBQUM7WUFDaEgsTUFBTSxJQUFJLGdDQUFrQixDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDekQ7SUFDTCxDQUFDO0NBU0o7QUFsRUQsZ0NBa0VDO0FBRUQsZ0ZBQWdGO0FBQ2hGLGNBQWM7QUFDZCxnRkFBZ0YifQ==