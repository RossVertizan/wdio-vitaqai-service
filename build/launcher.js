//==============================================================================
// (c) Vertizan Limited 2020-2021
//==============================================================================
import logger from '@wdio/logger';
// Packages
import { SevereServiceError } from 'webdriverio';
const log = logger('wdio-vitaqai-service');
export default class VitaqLauncher {
    _options;
    _capabilities;
    _config;
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
            throw new SevereServiceError('Errors detected in the configuration for running Vitaq');
        }
    }
}
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF1bmNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZ0ZBQWdGO0FBQ2hGLGlDQUFpQztBQUNqQyxnRkFBZ0Y7QUFDaEYsT0FBTyxNQUFNLE1BQU0sY0FBYyxDQUFBO0FBRWpDLFdBQVc7QUFDWCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFhaEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFMUMsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFhO0lBQ3RCLFFBQVEsQ0FBcUI7SUFDN0IsYUFBYSxDQUErQjtJQUM1QyxPQUFPLENBQWU7SUFFOUIsWUFDSSxPQUE0QixFQUM1QixZQUEyQyxFQUMzQyxNQUFxQjtRQUVyQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtRQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQTtRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtJQUN6QixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBRSxNQUFxQixFQUFFLFlBQXFCO1FBQ3pELEdBQUcsQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQTtRQUN2RCxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN6QyxJQUFJLFlBQVksR0FBWSxJQUFJLENBQUE7UUFFaEMsMENBQTBDO1FBQzFDLDhDQUE4QztRQUM5QyxxREFBcUQ7UUFDckQsc0VBQXNFO1FBQ3RFLElBQUksYUFBYSxHQUFZLElBQUksQ0FBQztRQUNsQyxJQUFJLE9BQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7WUFDckMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzNCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2hDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUM1QixHQUFHLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDaEQ7eUJBQ0k7d0JBQ0QsOENBQThDO3dCQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7d0JBQ25ELGFBQWEsR0FBRyxLQUFLLENBQUM7cUJBQ3pCO2lCQUNKO3FCQUNJO29CQUNELHlDQUF5QztvQkFDekMsR0FBRyxDQUFDLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO29CQUN6RSxhQUFhLEdBQUcsS0FBSyxDQUFDO2lCQUN6QjthQUNKO2lCQUNJO2dCQUNELGtDQUFrQztnQkFDbEMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2dCQUNuRCxhQUFhLEdBQUcsS0FBSyxDQUFDO2FBQ3pCO1NBQ0o7YUFDSTtZQUNELHNCQUFzQjtZQUN0QixHQUFHLENBQUMsS0FBSyxDQUFDLDJHQUEyRyxDQUFDLENBQUM7U0FDMUg7UUFDRCxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hCLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0dBQXNHLENBQUMsQ0FBQztZQUNsSCxHQUFHLENBQUMsS0FBSyxDQUFDLGtGQUFrRixDQUFDLENBQUM7WUFDOUYsR0FBRyxDQUFDLEtBQUssQ0FBQyxtRkFBbUYsQ0FBQyxDQUFDO1lBQy9GLFlBQVksR0FBRyxLQUFLLENBQUM7U0FDeEI7UUFFRCxrREFBa0Q7UUFDbEQsSUFBSSxlQUFlLEdBQVksSUFBSSxDQUFDO1FBQ3BDLElBQUksT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDL0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1lBQzVELEdBQUcsQ0FBQyxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztZQUMxRSxlQUFlLEdBQUcsS0FBSyxDQUFBO1NBQzFCO1FBQ0QsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxLQUFLLFdBQVcsRUFBRTtZQUNsRCxHQUFHLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7WUFDL0QsR0FBRyxDQUFDLEtBQUssQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO1lBQ3JGLGVBQWUsR0FBRyxLQUFLLENBQUE7U0FDMUI7UUFDRCxJQUFJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsS0FBSyxXQUFXLEVBQUU7WUFDdkQsR0FBRyxDQUFDLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1lBQ3BFLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQTtZQUMvRSxlQUFlLEdBQUcsS0FBSyxDQUFBO1NBQzFCO1FBQ0QsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFdBQVcsRUFBRTtZQUNqRCxHQUFHLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7WUFDOUQsR0FBRyxDQUFDLEtBQUssQ0FBQyxnSUFBZ0ksQ0FBQyxDQUFBO1lBQzNJLGVBQWUsR0FBRyxLQUFLLENBQUE7U0FDMUI7UUFDRCxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ2xCLEdBQUcsQ0FBQyxLQUFLLENBQUMsNEZBQTRGLENBQUMsQ0FBQztZQUN4RyxZQUFZLEdBQUcsS0FBSyxDQUFDO1NBQ3hCO1FBRUQsOENBQThDO1FBQzlDLElBQUksTUFBTSxDQUFDLFNBQVMsS0FBSyxlQUFlLEVBQUU7WUFDdEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxpRUFBaUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7WUFDOUYsR0FBRyxDQUFDLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFBO1lBQ3pFLEdBQUcsQ0FBQyxLQUFLLENBQUMsMkdBQTJHLENBQUMsQ0FBQTtZQUN0SCxZQUFZLEdBQUcsS0FBSyxDQUFDO1NBQ3hCO1FBRUQscURBQXFEO1FBQ3JELElBQUksQ0FBRSxZQUFZLEVBQUU7WUFDaEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxvR0FBb0csQ0FBQyxDQUFDO1lBQ2hILE1BQU0sSUFBSSxrQkFBa0IsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1NBQzFGO0lBQ0wsQ0FBQztDQVNKO0FBRUQsZ0ZBQWdGO0FBQ2hGLGNBQWM7QUFDZCxnRkFBZ0YifQ==