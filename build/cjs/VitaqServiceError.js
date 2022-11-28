"use strict";
// (c) Vertizan Limited 2011-2022
//==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
//https://javascript.info/custom-errors
class VitaqServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "VitaqServiceError";
    }
}
exports.default = VitaqServiceError;
// =============================================================================
// END OF FILE
// =============================================================================
