//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================

import logger from '@wdio/logger'

const log = logger('@wdio/vitaq-service')
export default class VitaqLauncher {
    constructor (options, capabilities, config) {
        this.options = options
    }

    /**
     * modify config and launch sauce connect
     */
    async onPrepare (config, capabilities) {
        log.info("Running the launcher onPrepare method")
    }

    async startTunnel(retryCount = 0) {
        log.info("Running the launcher startTunnel method")
    }

    /**
     * shut down
     */
    onComplete () {
        log.info("Running the launcher onComplete method")
    }
}

// =============================================================================
// END OF FILE
// =============================================================================
