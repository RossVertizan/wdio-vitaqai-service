"use strict";
//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkArgumentTypes = exports.countArgumentsReceived = exports.countNonOptionalArguments = exports.validateArguments = void 0;
const VitaqServiceError_1 = require("./VitaqServiceError");
/**
 * Function to check as much as possible on the passed arguments to trap errors
 * early
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
function validateArguments(functionName, argumentsDescription, argumentsObject) {
    // First count the number if non-optional arguments and compare that with the
    // number of arguments passed
    let numberArgsRequired = countNonOptionalArguments(argumentsDescription);
    let numberArgsReceived = countArgumentsReceived(argumentsObject);
    if (numberArgsRequired > numberArgsReceived) {
        throw new VitaqServiceError_1.VitaqServiceError(`${functionName} requires a minimum of ${numberArgsRequired} argument(s) but received ${numberArgsReceived}`);
    }
    // Next go through each argument in turn and validate its type
    checkArgumentTypes(functionName, argumentsDescription, argumentsObject);
}
exports.validateArguments = validateArguments;
/**
 * Get the number of non-optionel arguments from the argumentsDescription object
 * @param argumentsDescription  -the arguments description object passed in
 */
function countNonOptionalArguments(argumentsDescription) {
    let key;
    let count = 0;
    let keys = Object.keys(argumentsDescription);
    for (let index = 0; index < keys.length; index += 1) {
        key = keys[index];
        if (!key.endsWith("?")) {
            count += 1;
        }
    }
    return count;
}
exports.countNonOptionalArguments = countNonOptionalArguments;
/**
 * Count how many arguments we received
 * @param argumentsObject - the Javascript arguments object
 */
function countArgumentsReceived(argumentsObject) {
    let numberReceivedArguments = 0;
    // Go through the arguments and only count those that are NOT undefined
    for (let index = 0; index < argumentsObject.length; index += 1) {
        if (typeof argumentsObject[index] !== "undefined") {
            numberReceivedArguments += 1;
        }
    }
    return numberReceivedArguments;
}
exports.countArgumentsReceived = countArgumentsReceived;
/**
 * Check that the arguments provided match the type in the description
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
function checkArgumentTypes(functionName, argumentsDescription, argumentsObject) {
    let descriptionKey;
    let descriptionType;
    let descriptionKeys = Object.keys(argumentsDescription);
    let passedValue;
    for (let index = 0; index < descriptionKeys.length; index += 1) {
        descriptionKey = descriptionKeys[index];
        descriptionType = argumentsDescription[descriptionKey];
        passedValue = argumentsObject[index];
        if (typeof passedValue === "undefined") {
            // Check for undefined arguments of required arguments
            if (!descriptionKey.endsWith("?")) {
                throw new VitaqServiceError_1.VitaqServiceError(`Argument ${index + 1} of ${functionName} is a required argument but is undefined`);
            }
        }
        else if (descriptionType === "array") {
            // array is not a standard typeof type, so check it with Array.isArray
            if (!Array.isArray(passedValue)) {
                throw new VitaqServiceError_1.VitaqServiceError(`Argument ${index + 1} of ${functionName} is expected to be of type ${descriptionType}`);
            }
        }
        else if (typeof passedValue !== descriptionType) {
            throw new VitaqServiceError_1.VitaqServiceError(`Argument ${index + 1} of ${functionName} is expected to be of type ${descriptionType}`);
        }
        else if (descriptionType === "string") {
            // While we are here check for empty strings
            if (passedValue.length < 1) {
                throw new VitaqServiceError_1.VitaqServiceError(`Argument ${index + 1} of ${functionName} was given as an empty string`);
            }
        }
    }
}
exports.checkArgumentTypes = checkArgumentTypes;
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0ZBQWdGO0FBQ2hGLGlDQUFpQztBQUNqQyxnRkFBZ0Y7OztBQUdoRiwyREFBdUQ7QUFFdkQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsWUFBb0IsRUFDcEIsb0JBQTZDLEVBQzdDLGVBQXVCO0lBRXJELDZFQUE2RTtJQUM3RSw2QkFBNkI7SUFDN0IsSUFBSSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ3hFLElBQUksa0JBQWtCLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDaEUsSUFBSSxrQkFBa0IsR0FBRyxrQkFBa0IsRUFBRTtRQUN6QyxNQUFNLElBQUkscUNBQWlCLENBQUMsR0FBRyxZQUFZLDBCQUEwQixrQkFBa0IsNkJBQTZCLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtLQUM1STtJQUVELDhEQUE4RDtJQUM5RCxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFFNUUsQ0FBQztBQWZELDhDQWVDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IseUJBQXlCLENBQUMsb0JBQXdCO0lBQzlELElBQUksR0FBVyxDQUFDO0lBQ2hCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztJQUN0QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDNUMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNqRCxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFD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