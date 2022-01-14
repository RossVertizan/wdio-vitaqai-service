//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================
import type { VitaqServiceOptions } from './types'

export const DEFAULT_OPTIONS: Partial<VitaqServiceOptions> = {
    url: "https://vitaq.online",
    userName: undefined,
    userAPIKey: undefined,
    testActivityName: undefined,
    projectName: undefined,
    useSync: false,
    reloadSession: false,
    sequence: undefined,
    authenticationTimeout: 20000,
    nextActionTimeout: 10000,
    scriptTimeout: 20000,
    sessionTimeout: 20000,
    debug: false,
    _stopOnVitaqError: true,
    _local: false,
    _noscriptwrite: false
}

// =============================================================================
// END OF FILE
// =============================================================================
