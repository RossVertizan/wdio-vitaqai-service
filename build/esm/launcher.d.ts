import type { Capabilities, Options } from '@wdio/types';
interface VtqTestRunner extends Options.Testrunner {
    debug: boolean;
}
import { VitaqServiceOptions } from './types';
export default class VitaqLauncher {
    private _options;
    private _capabilities;
    private _config;
    constructor(options: VitaqServiceOptions, capabilities: Capabilities.RemoteCapability, config: VtqTestRunner);
    onPrepare(config: VtqTestRunner, capabilities: unknown): Promise<void>;
}
export {};
