//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import VitaqLauncher from './launcher'
import VitaqService from './service'
import { VitaqServiceOptions } from './types'

export default VitaqService
export const launcher = VitaqLauncher
export * from './types'

declare global {
    namespace WebdriverIO {
        interface ServiceOption extends VitaqServiceOptions {}
    }
}
// =============================================================================
// END OF FILE
// =============================================================================
