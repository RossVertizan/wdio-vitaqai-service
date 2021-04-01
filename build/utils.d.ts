/**
 * Determine if the current instance is a Unified Platform instance
 * @param {string} deviceName
 * @param {string} platformName
 * @returns {boolean}
 *
 * This is what we get back from the UP (for now)
 *
 * capabilities =  {
 *  webStorageEnabled: false,
 *  locationContextEnabled: false,
 *  browserName: 'safari',
 *  platform: 'MAC',
 *  javascriptEnabled: true,
 *  databaseEnabled: false,
 *  takesScreenshot: true,
 *  networkConnectionEnabled: false,
 *  platformVersion: '12.1.2',
 *  webDriverAgentUrl: 'http://127.0.0.1:5700',
 *  testobject_platform_name: 'iOS',
 *  orientation: 'PORTRAIT',
 *  realDevice: true,
 *  build: 'Vitaq Real Device browser iOS - 1594732389756',
 *  commandTimeouts: { default: 60000 },
 *  testobject_device: 'iPhone_XS_ws',
 *  automationName: 'XCUITest',
 *  platformName: 'iOS',
 *  udid: '',
 *  deviceName: '',
 *  testobject_test_report_api_url: '',
 *  testobject_test_report_url: '',
 *  testobject_user_id: 'wim.selles',
 *  testobject_project_id: 'saucelabs-default',
 *  testobject_test_report_id: 51,
 *  testobject_device_name: 'iPhone XS',
 *  testobject_device_session_id: '',
 *  deviceContextId: ''
 * }
 */
export function isUnifiedPlatform({ deviceName, platformName }: string): boolean;
/**
 * Determine if this is an EMUSIM session
 * @param {string} deviceName
 * @param {string} platformName
 * @returns {boolean}
 */
export function isEmuSim({ deviceName, platformName }: string): boolean;
/** Ensure capabilities are in the correct format for Vitaq Labs
 * @param {string} tunnelIdentifier - The default Vitaq Connect tunnel identifier
 * @param {object} options - Additional options to set on the capability
 * @returns {function(object): void} - A function that mutates a single capability
 */
export function makeCapabilityFactory(tunnelIdentifier: string, options: object): (arg0: object) => void;
//# sourceMappingURL=utils.d.ts.map