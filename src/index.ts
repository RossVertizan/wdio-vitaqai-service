//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import VitaqLauncher from './launcher.js'
import VitaqService from './service.js'
import { VitaqServiceOptions } from './types.js'

export default VitaqService
export const launcher = VitaqLauncher
export * from './types.js'

declare global {
    namespace WebdriverIO {
        interface ServiceOption extends VitaqServiceOptions {}
    }
}
// =============================================================================
// END OF FILE
// =============================================================================
