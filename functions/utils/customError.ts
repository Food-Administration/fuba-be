class CustomError extends Error {
    status: number;
    error_code?: string;
    isEmailVerified?: boolean;

    constructor(message: string, status: number, error_code?: string, isEmailVerified?: boolean) {
        super(message);
        this.status = status;
        this.error_code = error_code;
        this.isEmailVerified = isEmailVerified;
    }
}

export default CustomError;