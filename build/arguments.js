//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================
import VitaqServiceError from "./VitaqServiceError.js";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxnRkFBZ0Y7QUFDaEYsaUNBQWlDO0FBQ2pDLGdGQUFnRjtBQUVoRixPQUFPLGlCQUFpQixNQUFNLHdCQUF3QixDQUFBO0FBRXREOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxZQUFvQixFQUNwQixvQkFBNkMsRUFDN0MsZUFBdUI7SUFFckQsNkVBQTZFO0lBQzdFLDZCQUE2QjtJQUM3QixJQUFJLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDeEUsSUFBSSxrQkFBa0IsR0FBRyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUNoRSxJQUFJLGtCQUFrQixHQUFHLGtCQUFrQixFQUFFO1FBQ3pDLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLFlBQVksMEJBQTBCLGtCQUFrQiw2QkFBNkIsa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO0tBQzVJO0lBRUQsOERBQThEO0lBQzlELGtCQUFrQixDQUFDLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUV4RSw4Q0FBOEM7SUFDOUMscURBQXFEO0lBQ3JELE9BQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUUsT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFBLENBQUEsQ0FBQyxDQUFDLENBQUE7QUFDMUUsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxvQkFBd0I7SUFDOUQsSUFBSSxHQUFXLENBQUM7SUFDaEIsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO0lBQ3RCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUM1QyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFB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