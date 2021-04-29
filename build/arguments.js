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
    // And finally filter out any undefined values
    // (which by now should belong to optional arguments)
    return argumentsObject.filter((value) => { return value !== undefined; });
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
        if (descriptionType === "any") {
            // Can't check type of any
        }
        else if (typeof passedValue === "undefined") {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0ZBQWdGO0FBQ2hGLGlDQUFpQztBQUNqQyxnRkFBZ0Y7OztBQUdoRiwyREFBdUQ7QUFFdkQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsWUFBb0IsRUFDcEIsb0JBQTZDLEVBQzdDLGVBQXVCO0lBRXJELDZFQUE2RTtJQUM3RSw2QkFBNkI7SUFDN0IsSUFBSSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ3hFLElBQUksa0JBQWtCLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDaEUsSUFBSSxrQkFBa0IsR0FBRyxrQkFBa0IsRUFBRTtRQUN6QyxNQUFNLElBQUkscUNBQWlCLENBQUMsR0FBRyxZQUFZLDBCQUEwQixrQkFBa0IsNkJBQTZCLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtLQUM1STtJQUVELDhEQUE4RDtJQUM5RCxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFeEUsOENBQThDO0lBQzlDLHFEQUFxRDtJQUNyRCxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFFLE9BQU8sS0FBSyxLQUFLLFNBQVMsQ0FBQSxDQUFBLENBQUMsQ0FBQyxDQUFBO0FBQzFFLENBQUM7QUFsQkQsOENBa0JDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IseUJBQXlCLENBQUMsb0JBQXdCO0lBQzlELElBQUksR0FBVyxDQUFDO0lBQ2hCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztJQUN0QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDNUMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNqRCxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFDO1lBQ3BCLEtBQUssSUFBSSxDQUFDLENBQUE7U0FDYjtLQUNKO0lBQ0QsT0FBTyxLQUFLLENBQUE7QUFDaEIsQ0FBQztBQVhELDhEQVdDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsZUFBdUI7SUFDMUQsSUFBSSx1QkFBdUIsR0FBRyxDQUFDLENBQUM7SUFDaEMsdUVBQXVFO0lBQ3ZFLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUU7UUFDNUQsSUFBSSxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxXQUFXLEVBQUU7WUFDL0MsdUJBQXVCLElBQUksQ0FBQyxDQUFBO1NBQy9CO0tBQ0o7SUFDRCxPQUFPLHVCQUF1QixDQUFBO0FBQ2xDLENBQUM7QUFURCx3REFTQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsWUFBb0IsRUFDM0Isb0JBQTZDLEVBQzdDLGVBQXVCO0lBQy9DLElBQUksY0FBc0IsQ0FBQztJQUMzQixJQUFJLGVBQXVCLENBQUM7SUFDNUIsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ3ZELElBQUksV0FBZ0IsQ0FBQztJQUNyQixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO1FBQzVELGNBQWMsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEMsZUFBZSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZELFdBQVcsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDcEMsSUFBSSxlQUFlLEtBQUssS0FBSyxFQUFFO1lBQzNCLDBCQUEwQjtTQUM3QjthQUFNLElBQUksT0FBTyxXQUFXLEtBQUssV0FBVyxFQUFFO1lBQzNDLHNEQUFzRDtZQUN0RCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLHFDQUFpQixDQUFDLFlBQVksS0FBSyxHQUFDLENBQUMsT0FBTyxZQUFZLDBDQUEwQyxDQUFDLENBQUE7YUFDaEg7U0FDSjthQUFNLElBQUksZUFBZSxLQUFLLE9BQU8sRUFBRTtZQUNwQyxzRUFBc0U7WUFDdEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEtBQUssR0FBQyxDQUFDLE9BQU8sWUFBWSw4QkFBOEIsZUFBZSxFQUFFLENBQUMsQ0FBQTthQUNySDtTQUNKO2FBQU0sSUFBSSxPQUFPLFdBQVcsS0FBSyxlQUFlLEVBQUM7WUFDOUMsTUFBTSxJQUFJLHFDQUFpQixDQUFDLFlBQVksS0FBSyxHQUFDLENBQUMsT0FBTyxZQUFZLDhCQUE4QixlQUFlLEVBQUUsQ0FBQyxDQUFBO1NBQ3JIO2FBQU0sSUFBSSxlQUFlLEtBQUssUUFBUSxFQUFFO1lBQ3JDLDRDQUE0QztZQUM1QyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixNQUFNLElBQUkscUNBQWlCLENBQUMsWUFBWSxLQUFLLEdBQUMsQ0FBQyxPQUFPLFlBQVksK0JBQStCLENBQUMsQ0FBQTthQUNyRztTQUNKO0tBQ0o7QUFDTCxDQUFDO0FBaENELGdEQWdDQztBQUVELGdGQUFnRjtBQUNoRixjQUFjO0FBQ2QsZ0ZBQWdGIn0=