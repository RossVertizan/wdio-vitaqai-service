import VitaqLauncher from './launcher.js';
import VitaqService from './service.js';
import { VitaqServiceOptions } from './types.js';
export default VitaqService;
export declare const launcher: typeof VitaqLauncher;
export * from './types.js';
declare global {
    namespace WebdriverIO {
        interface ServiceOption extends VitaqServiceOptions {
        }
    }
}
//# sourceMappingURL=index.d.ts.map