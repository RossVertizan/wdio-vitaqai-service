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
    _stopOnVitaqError: true,
    _local: false
}

// =============================================================================
// END OF FILE
// =============================================================================
