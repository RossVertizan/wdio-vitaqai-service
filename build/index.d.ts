import VitaqLauncher from './launcher';
import VitaqService from './service';
import { VitaqServiceOptions } from './types';
export default VitaqService;
export declare const launcher: typeof VitaqLauncher;
export * from './types';
declare global {
    namespace WebdriverIO {
        interface ServiceOption extends VitaqServiceOptions {
        }
    }
}
//# sourceMappingURL=index.d.ts.map