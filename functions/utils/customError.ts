class CustomError extends Error {
    status: number;
    isEmailVerified?: boolean;

    constructor(message: string, status: number, isEmailVerified?: boolean) {
        super(message);
        this.status = status;
        this.isEmailVerified = isEmailVerified;
    }
}

export default CustomError;