// (c) Vertizan Limited 2011-2022
//==============================================================================

//https://javascript.info/custom-errors

export default class VitaqServiceError extends Error {
    constructor(message: string | undefined) {
        super(message);
        this.name = "VitaqServiceError";
    }
}

// =============================================================================
// END OF FILE
// =============================================================================
