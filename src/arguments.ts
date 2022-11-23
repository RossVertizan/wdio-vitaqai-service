//==============================================================================
// (c) Vertizan Limited 2011-2022
//==============================================================================

import VitaqServiceError from "./VitaqServiceError"

/**
 * Function to check as much as possible on the passed arguments to trap errors
 * early
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
export function validateArguments(functionName: string,
                                  argumentsDescription: { [p: string]: string },
                                  argumentsObject: any []) {

    // First count the number if non-optional arguments and compare that with the
    // number of arguments passed
    let numberArgsRequired = countNonOptionalArguments(argumentsDescription)
    let numberArgsReceived = countArgumentsReceived(argumentsObject)
    if (numberArgsRequired > numberArgsReceived) {
        throw new VitaqServiceError(`${functionName} requires a minimum of ${numberArgsRequired} argument(s) but received ${numberArgsReceived}`)
    }

    // Next go through each argument in turn and validate its type
    checkArgumentTypes(functionName, argumentsDescription, argumentsObject);

    // And finally filter out any undefined values
    // (which by now should belong to optional arguments)
    return argumentsObject.filter((value) => {return value !== undefined})
}

/**
 * Get the number of non-optionel arguments from the argumentsDescription object
 * @param argumentsDescription  -the arguments description object passed in
 */
export function countNonOptionalArguments(argumentsDescription: {}) {
    let key: string;
    let count: number = 0;
    let keys = Object.keys(argumentsDescription)
    for (let index = 0; index < keys.length; index += 1) {
        key = keys[index];
        if (! key.endsWith("?")){
            count += 1
        }
    }
    return count
}

/**
 * Count how many arguments we received
 * @param argumentsObject - the Javascript arguments object
 */
export function countArgumentsReceived(argumentsObject: any []) {
    let numberReceivedArguments = 0;
    // Go through the arguments and only count those that are NOT undefined
    for (let index = 0; index < argumentsObject.length; index += 1) {
        if (typeof argumentsObject[index] !== "undefined") {
            numberReceivedArguments += 1
        }
    }
    return numberReceivedArguments
}

/**
 * Check that the arguments provided match the type in the description
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
export function checkArgumentTypes(functionName: string,
                            argumentsDescription: { [p: string]: string },
                            argumentsObject: any []) {
    let descriptionKey: string;
    let descriptionType: string;
    let descriptionKeys = Object.keys(argumentsDescription)
    let passedValue: any;
    for (let index = 0; index < descriptionKeys.length; index += 1) {
        descriptionKey = descriptionKeys[index];
        descriptionType = argumentsDescription[descriptionKey];
        passedValue = argumentsObject[index]
        if (descriptionType === "any") {
            // Can't check type of any
        } else if (typeof passedValue === "undefined") {
            // Check for undefined arguments of required arguments
            if (!descriptionKey.endsWith("?")) {
                throw new VitaqServiceError(`Argument ${index+1} of ${functionName} is a required argument but is undefined`)
            }
        } else if (descriptionType === "array") {
            // array is not a standard typeof type, so check it with Array.isArray
            if (!Array.isArray(passedValue)) {
                throw new VitaqServiceError(`Argument ${index + 1} of ${functionName} is expected to be of type ${descriptionType}`)
            }
        } else if (descriptionType === "numberOrBool") {
            if (typeof passedValue !== "number" && typeof passedValue !== "boolean") {
                throw new VitaqServiceError(`Argument ${index+1} of ${functionName} is expected to be of type number or boolean`)
            }
        } else if (typeof passedValue !== descriptionType){
            throw new VitaqServiceError(`Argument ${index+1} of ${functionName} is expected to be of type ${descriptionType}`)
        } else if (descriptionType === "string") {
            // While we are here check for empty strings
            if (passedValue.length < 1) {
                throw new VitaqServiceError(`Argument ${index+1} of ${functionName} was given as an empty string`)
            }
        }
    }
}

// =============================================================================
// END OF FILE
// =============================================================================
