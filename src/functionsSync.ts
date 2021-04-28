import {validateArguments} from "./arguments";

// Type import
// @ts-ignore
import VitaqAiApi from 'vitaqai_api'
import type { Browser, MultiRemoteBrowser } from 'webdriverio'

// import logger from '@wdio/logger'
const logger = require('@wdio/logger').default;
const log = logger('@wdio/vitaq-service')

/**
 * Query if the action is enabled
 * @param actionName - name of the action
 * @param browser
 * @param api
 */
export function getEnabled(actionName: string,
                           browser: Browser<'async'> | MultiRemoteBrowser<'async'>,
                           api: VitaqAiApi) {
    let args: any [] = Array.from(arguments);
    args.splice(-2, 2)
    log.debug('VitaqService: getEnabled: actionName', actionName);
    let argumentsDescription = {"actionName": "string"}
    validateArguments("getEnabled", argumentsDescription, args);
    // @ts-ignore
    return browser.call(() =>
        api.runCommandCaller('get_enabled', args)
    )
}
