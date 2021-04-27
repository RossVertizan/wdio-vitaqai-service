//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================

//https://javascript.info/custom-errors

exports.VitaqServiceError = class VitaqServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "VitaqError";
    }
}

// =============================================================================
// END OF FILE
// =============================================================================
