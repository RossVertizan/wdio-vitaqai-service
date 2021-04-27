//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================


import { VitaqServiceError } from "./VitaqServiceError"

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

}

/**
 * Get the number of non-optionel arguments from the argumentsDescription object
 * @param argumentsDescription  -the arguments description object passed in
 */
function countNonOptionalArguments(argumentsDescription: {}) {
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
function countArgumentsReceived(argumentsObject: any []) {
    return argumentsObject.length
}

/**
 * Check that the arguments provided match the type in the description
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
function checkArgumentTypes(functionName: string,
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
        if (typeof passedValue !== descriptionType){
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
