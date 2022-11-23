// (c) Vertizan Limited 2011-2022
//==============================================================================
//https://javascript.info/custom-errors
export default class VitaqServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "VitaqServiceError";
    }
}
// =============================================================================
// END OF FILE
// =============================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVml0YXFTZXJ2aWNlRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvVml0YXFTZXJ2aWNlRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaUNBQWlDO0FBQ2pDLGdGQUFnRjtBQUVoRix1Q0FBdUM7QUFFdkMsTUFBTSxDQUFDLE9BQU8sT0FBTyxpQkFBa0IsU0FBUSxLQUFLO0lBQ2hELFlBQVksT0FBMkI7UUFDbkMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQztJQUNwQyxDQUFDO0NBQ0o7QUFFRCxnRkFBZ0Y7QUFDaEYsY0FBYztBQUNkLGdGQUFnRiJ9