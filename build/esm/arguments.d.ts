/**
 * Function to check as much as possible on the passed arguments to trap errors
 * early
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
export declare function validateArguments(functionName: string, argumentsDescription: {
    [p: string]: string;
}, argumentsObject: any[]): any[];
/**
 * Get the number of non-optionel arguments from the argumentsDescription object
 * @param argumentsDescription  -the arguments description object passed in
 */
export declare function countNonOptionalArguments(argumentsDescription: {}): number;
/**
 * Count how many arguments we received
 * @param argumentsObject - the Javascript arguments object
 */
export declare function countArgumentsReceived(argumentsObject: any[]): number;
/**
 * Check that the arguments provided match the type in the description
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
export declare function checkArgumentTypes(functionName: string, argumentsDescription: {
    [p: string]: string;
}, argumentsObject: any[]): void;
