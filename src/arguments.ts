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
module.exports = function validateArguments(functionName: string,
                                            argumentsDescription: {[index: string]: string;},
                                            argumentsObject: {[index: string]: string;}) {

    // First count the number if non-optional arguments and compare that with the
    // number of arguments passed
    let numberArgsRequired = countNonOptionalArguments(argumentsDescription)
    let numberArgsReceived = countArgumentsReceived(argumentsObject)
    if (numberArgsRequired > numberArgsReceived) {
        throw new VitaqServiceError(`${functionName} requires a minimum of ${numberArgsRequired} but only received ${numberArgsReceived}`)
    }

    // Next go through each argument in turn and validate its type
    let descriptionKey: string;
    let descriptionType: string;
    let descriptionKeys = Object.keys(argumentsDescription)
    let passedKey: string;
    let passedValue: any;
    let passedKeys = Object.keys(argumentsObject)
    for (let index = 0; index < descriptionKeys.length; index += 1) {
        descriptionKey = descriptionKeys[index];
        descriptionType = argumentsDescription[descriptionKey];
        passedKey = passedKeys[index]
        passedValue = argumentsObject[passedKey]
        if (typeof passedValue !== descriptionType){
            throw new VitaqServiceError(`Argument ${index+1} of ${functionName} is expected to be of type ${descriptionType}`)
        }
    }
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
function countArgumentsReceived(argumentsObject: {}) {
    return Object.values(argumentsObject).length
}

// =============================================================================
// END OF FILE
// =============================================================================
