"use strict";
//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArguments = void 0;
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
/**
 * Count how many arguments we received
 * @param argumentsObject - the Javascript arguments object
 */
function countArgumentsReceived(argumentsObject) {
    return argumentsObject.length;
}
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
        if (descriptionType === "array") {
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
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0ZBQWdGO0FBQ2hGLGlDQUFpQztBQUNqQyxnRkFBZ0Y7OztBQUdoRiwyREFBdUQ7QUFFdkQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsWUFBb0IsRUFDcEIsb0JBQTZDLEVBQzdDLGVBQXVCO0lBRXJELDZFQUE2RTtJQUM3RSw2QkFBNkI7SUFDN0IsSUFBSSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ3hFLElBQUksa0JBQWtCLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDaEUsSUFBSSxrQkFBa0IsR0FBRyxrQkFBa0IsRUFBRTtRQUN6QyxNQUFNLElBQUkscUNBQWlCLENBQUMsR0FBRyxZQUFZLDBCQUEwQixrQkFBa0IsNkJBQTZCLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtLQUM1STtJQUVELDhEQUE4RDtJQUM5RCxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFFNUUsQ0FBQztBQWZELDhDQWVDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyx5QkFBeUIsQ0FBQyxvQkFBd0I7SUFDdkQsSUFBSSxHQUFXLENBQUM7SUFDaEIsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO0lBQ3RCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUM1QyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO1FBQ2pELEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUM7WUFDcEIsS0FBSyxJQUFJLENBQUMsQ0FBQTtTQUNiO0tBQ0o7SUFDRCxPQUFPLEtBQUssQ0FBQTtBQUNoQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxzQkFBc0IsQ0FBQyxlQUF1QjtJQUNuRCxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUE7QUFDakMsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxrQkFBa0IsQ0FBQyxZQUFvQixFQUNwQixvQkFBNkMsRUFDN0MsZUFBdUI7SUFDL0MsSUFBSSxjQUFzQixDQUFDO0lBQzNCLElBQUksZUFBdUIsQ0FBQztJQUM1QixJQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDdkQsSUFBSSxXQUFnQixDQUFDO0lBQ3JCLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUU7UUFDNUQsY0FBYyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxlQUFlLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkQsV0FBVyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNwQyxJQUFJLGVBQWUsS0FBSyxPQUFPLEVBQUU7WUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEtBQUssR0FBQyxDQUFDLE9BQU8sWUFBWSw4QkFBOEIsZUFBZSxFQUFFLENBQUMsQ0FBQTthQUNySDtTQUNKO2FBQU0sSUFBSSxPQUFPLFdBQVcsS0FBSyxlQUFlLEVBQUM7WUFDOUMsTUFBTSxJQUFJLHFDQUFpQixDQUFDLFlBQVksS0FBSyxHQUFDLENBQUMsT0FBTyxZQUFZLDhCQUE4QixlQUFlLEVBQUUsQ0FBQyxDQUFBO1NBQ3JIO2FBQU0sSUFBSSxlQUFlLEtBQUssUUFBUSxFQUFFO1lBQ3JDLDRDQUE0QztZQUM1QyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixNQUFNLElBQUkscUNBQWlCLENBQUMsWUFBWSxLQUFLLEdBQUMsQ0FBQyxPQUFPLFlBQVksK0JBQStCLENBQUMsQ0FBQTthQUNyRztTQUNKO0tBQ0o7QUFDTCxDQUFDO0FBRUQsZ0ZBQWdGO0FBQ2hGLGNBQWM7QUFDZCxnRkFBZ0YifQ==