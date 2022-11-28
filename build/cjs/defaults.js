"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = void 0;
exports.DEFAULT_OPTIONS = {
    url: (_a = process.env.VTQ_RUNNER_URL) !== null && _a !== void 0 ? _a : "https://vitaq.online",
    userName: undefined,
    userAPIKey: undefined,
    testActivityName: undefined,
    projectName: undefined,
    useSync: false,
    reloadSession: false,
    sequence: undefined,
    sequences: false,
    actions: false,
    authenticationTimeout: 20000,
    nextActionTimeout: 300000,
    scriptTimeout: 20000,
    sessionTimeout: 20000,
    debug: false,
    _stopOnVitaqError: true,
    _local: false,
    _noscriptwrite: false
};
// =============================================================================
// END OF FILE
// =============================================================================
