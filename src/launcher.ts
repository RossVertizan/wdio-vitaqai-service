//==============================================================================
// (c) Vertizan Limited 2020-2021
//==============================================================================

import logger from '@wdio/logger'
const log = logger('@wdio/vitaq-service')

// Packages
import { SevereServiceError } from 'webdriverio'

// Type import
import type { Capabilities, Options} from '@wdio/types'

// Extend Options.Testrunner for Vitaq command line 'debug' option
interface VtqTestRunner extends Options.Testrunner {
    debug: boolean;
}

// Default options
import { VitaqServiceOptions } from './types'

// Have no need for this file at the moment, but keep it available.
export default class VitaqLauncher {
    private _options: VitaqServiceOptions
    private _capabilities: Capabilities.RemoteCapability
    private _config: VtqTestRunner

    constructor (
        options: VitaqServiceOptions,
        capabilities: Capabilities.RemoteCapability,
        config: VtqTestRunner)
    {
        this._options = options
        this._capabilities = capabilities
        this._config = config
    }

    async onPrepare (config: VtqTestRunner, capabilities: unknown) {
        log.debug("Running the vitaq-service onPrepare method")
        log.debug("config.specs: ", config.specs)
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
            throw new SevereServiceError('Specs are not grouped');
        }
    }

    // async onWorkerStart() {
    //     log.debug("Running the vitaq-service startTunnel method")
    // }
    //
    // onComplete () {
    //     log.debug("Running the vitaq-service onComplete method")
    // }
}

// =============================================================================
// END OF FILE
// =============================================================================
