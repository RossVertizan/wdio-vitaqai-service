/**
 * Function to check as much as possible on the passed arguments to trap errors
 * early
 * @param functionName - name of the function for which we are checking the arguments
 * @param argumentsDescription - object with the names of the arguments, ? at end indicates optional
 * @param argumentsObject - the arguments object that was passed
 */
export declare function validateArguments(functionName: string, argumentsDescription: {
    [p: string]: string;
}, argumentsObject: any[]): void;
//# sourceMappingURL=arguments.d.ts.map