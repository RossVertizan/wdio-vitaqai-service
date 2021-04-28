"use strict";
//==============================================================================
// (c) Vertizan Limited 2011-2021
//==============================================================================
//https://javascript.info/custom-errors
exports.VitaqServiceError = class VitaqServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "VitaqServiceError";
    }
};
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVml0YXFTZXJ2aWNlRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvVml0YXFTZXJ2aWNlRXJyb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdGQUFnRjtBQUNoRixpQ0FBaUM7QUFDakMsZ0ZBQWdGO0FBRWhGLHVDQUF1QztBQUV2QyxPQUFPLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxpQkFBa0IsU0FBUSxLQUFLO0lBQzdELFlBQVksT0FBTztRQUNmLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUM7SUFDcEMsQ0FBQztDQUNKLENBQUE7QUFFRCxnRkFBZ0Y7QUFDaEYsY0FBYztBQUNkLGdGQUFnRiJ9