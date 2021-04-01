"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCapabilityFactory = exports.isEmuSim = exports.isUnifiedPlatform = void 0;
const utils_1 = require("@wdio/utils");
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
function isUnifiedPlatform({ deviceName = '', platformName = '' }) {
    // If the string contains `simulator` or `emulator` it's an EMU/SIM session
    return !deviceName.match(/(simulator)|(emulator)/gi) && !!platformName.match(/(ios)|(android)/gi);
}
exports.isUnifiedPlatform = isUnifiedPlatform;
/**
 * Determine if this is an EMUSIM session
 * @param {string} deviceName
 * @param {string} platformName
 * @returns {boolean}
 */
function isEmuSim({ deviceName = '', platformName = '' }) {
    // If the string contains `simulator` or `emulator` it's an EMU/SIM session
    return !!deviceName.match(/(simulator)|(emulator)/gi) && !!platformName.match(/(ios)|(android)/gi);
}
exports.isEmuSim = isEmuSim;
/** Ensure capabilities are in the correct format for Vitaq Labs
 * @param {string} tunnelIdentifier - The default Vitaq Connect tunnel identifier
 * @param {object} options - Additional options to set on the capability
 * @returns {function(object): void} - A function that mutates a single capability
 */
function makeCapabilityFactory(tunnelIdentifier, options) {
    return capability => {
        // If the capability appears to be using the legacy JSON Wire Protocol
        // we need to make sure the key 'sauce:options' is not present
        const isLegacy = Boolean((capability.platform || capability.version) &&
            !utils_1.isW3C(capability) &&
            !capability['sauce:options']);
        // Unified Platform and EMUSIM is currently not W3C ready, so the tunnel needs to be on the cap level
        if (!capability['sauce:options'] && !isLegacy && !isUnifiedPlatform(capability) && !isEmuSim(capability)) {
            capability['sauce:options'] = {};
        }
        Object.assign(capability, options);
        const sauceOptions = !isLegacy && !isUnifiedPlatform(capability) && !isEmuSim(capability) ? capability['sauce:options'] : capability;
        sauceOptions.tunnelIdentifier = (capability.tunnelIdentifier ||
            sauceOptions.tunnelIdentifier ||
            tunnelIdentifier);
        if (!isLegacy && !isUnifiedPlatform(capability) && !isEmuSim(capability)) {
            delete capability.tunnelIdentifier;
        }
    };
}
exports.makeCapabilityFactory = makeCapabilityFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQW1DO0FBRW5DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUNILFNBQWdCLGlCQUFpQixDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsRUFBRSxZQUFZLEdBQUcsRUFBRSxFQUFFO0lBQ3BFLDJFQUEyRTtJQUMzRSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDckcsQ0FBQztBQUhELDhDQUdDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixRQUFRLENBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRSxFQUFFLFlBQVksR0FBRyxFQUFFLEVBQUU7SUFDM0QsMkVBQTJFO0lBQzNFLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3RHLENBQUM7QUFIRCw0QkFHQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixxQkFBcUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPO0lBQzNELE9BQU8sVUFBVSxDQUFDLEVBQUU7UUFDaEIsc0VBQXNFO1FBQ3RFLDhEQUE4RDtRQUM5RCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQ3BCLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQzNDLENBQUMsYUFBSyxDQUFDLFVBQVUsQ0FBQztZQUNsQixDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FDL0IsQ0FBQTtRQUVELHFHQUFxRztRQUNyRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDdEcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtTQUNuQztRQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRWxDLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFBO1FBQ3BJLFlBQVksQ0FBQyxnQkFBZ0IsR0FBRyxDQUM1QixVQUFVLENBQUMsZ0JBQWdCO1lBQzNCLFlBQVksQ0FBQyxnQkFBZ0I7WUFDN0IsZ0JBQWdCLENBQ25CLENBQUE7UUFFRCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDdEUsT0FBTyxVQUFVLENBQUMsZ0JBQWdCLENBQUE7U0FDckM7SUFDTCxDQUFDLENBQUE7QUFDTCxDQUFDO0FBNUJELHNEQTRCQyJ9