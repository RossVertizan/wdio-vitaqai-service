//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import { VitaqServiceError } from "./VitaqServiceError";
/**
 * Function to check as much as possible on the passed arguments to trap errors
 * early
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
export function validateArguments(functionName, argumentsDescription, argumentsObject) {
    // First count the number if non-optional arguments and compare that with the
    // number of arguments passed
    let numberArgsRequired = countNonOptionalArguments(argumentsDescription);
    let numberArgsReceived = countArgumentsReceived(argumentsObject);
    if (numberArgsRequired > numberArgsReceived) {
        throw new VitaqServiceError(`${functionName} requires a minimum of ${numberArgsRequired} argument(s) but received ${numberArgsReceived}`);
    }
    // Next go through each argument in turn and validate its type
    checkArgumentTypes(functionName, argumentsDescription, argumentsObject);
    // And finally filter out any undefined values
    // (which by now should belong to optional arguments)
    return argumentsObject.filter((value) => { return value !== undefined; });
}
/**
 * Get the number of non-optionel arguments from the argumentsDescription object
 * @param argumentsDescription  -the arguments description object passed in
 */
export function countNonOptionalArguments(argumentsDescription) {
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
export function countArgumentsReceived(argumentsObject) {
    let numberReceivedArguments = 0;
    // Go through the arguments and only count those that are NOT undefined
    for (let index = 0; index < argumentsObject.length; index += 1) {
        if (typeof argumentsObject[index] !== "undefined") {
            numberReceivedArguments += 1;
        }
    }
    return numberReceivedArguments;
}
/**
 * Check that the arguments provided match the type in the description
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
export function checkArgumentTypes(functionName, argumentsDescription, argumentsObject) {
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
                throw new VitaqServiceError(`Argument ${index + 1} of ${functionName} is a required argument but is undefined`);
            }
        }
        else if (descriptionType === "array") {
            // array is not a standard typeof type, so check it with Array.isArray
            if (!Array.isArray(passedValue)) {
                throw new VitaqServiceError(`Argument ${index + 1} of ${functionName} is expected to be of type ${descriptionType}`);
            }
        }
        else if (descriptionType === "numberOrBool") {
            if (typeof passedValue !== "number" && typeof passedValue !== "boolean") {
                throw new VitaqServiceError(`Argument ${index + 1} of ${functionName} is expected to be of type number or boolean`);
            }
        }
        else if (typeof passedValue !== descriptionType) {
            throw new VitaqServiceError(`Argument ${index + 1} of ${functionName} is expected to be of type ${descriptionType}`);
        }
        else if (descriptionType === "string") {
            // While we are here check for empty strings
            if (passedValue.length < 1) {
                throw new VitaqServiceError(`Argument ${index + 1} of ${functionName} was given as an empty string`);
            }
        }
    }
}
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxnRkFBZ0Y7QUFDaEYsaUNBQWlDO0FBQ2pDLGdGQUFnRjtBQUVoRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUV2RDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsWUFBb0IsRUFDcEIsb0JBQTZDLEVBQzdDLGVBQXVCO0lBRXJELDZFQUE2RTtJQUM3RSw2QkFBNkI7SUFDN0IsSUFBSSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ3hFLElBQUksa0JBQWtCLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDaEUsSUFBSSxrQkFBa0IsR0FBRyxrQkFBa0IsRUFBRTtRQUN6QyxNQUFNLElBQUksaUJBQWlCLENBQUMsR0FBRyxZQUFZLDBCQUEwQixrQkFBa0IsNkJBQTZCLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtLQUM1STtJQUVELDhEQUE4RDtJQUM5RCxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFeEUsOENBQThDO0lBQzlDLHFEQUFxRDtJQUNyRCxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFFLE9BQU8sS0FBSyxLQUFLLFNBQVMsQ0FBQSxDQUFBLENBQUMsQ0FBQyxDQUFBO0FBQzFFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsb0JBQXdCO0lBQzlELElBQUksR0FBVyxDQUFDO0lBQ2hCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztJQUN0QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDNUMsS0FBSyxJQUFJLEtBQUssR0FB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