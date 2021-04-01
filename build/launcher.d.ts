export default class VitaqLauncher {
    constructor(options: any, capabilities: any, config: any);
    options: any;
    /**
     * modify config and launch sauce connect
     */
    onPrepare(config: any, capabilities: any): Promise<void>;
    startTunnel(retryCount?: number): Promise<void>;
    /**
     * shut down
     */
    onComplete(): void;
}
//# sourceMappingURL=launcher.d.ts.map