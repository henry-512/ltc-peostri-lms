/** Wrapper for HTTP status codes */
export enum HTTPStatus {
    // Acceptable responses
    OK = 200,
    CREATED = 201,
    /** Received but not acted on */
    ACCEPTED = 202,
    /** No content, but headers are useful */
    NO_CONTENT = 204,
    /** Reset document */
    RESET_CONTENT = 205,
    /** Range header is only part of a resource */
    PARTIAL_CONTENT = 206,

    // Client error codes
    /** Client error and cannot process */
    BAD_REQUEST = 400,
    /** User unknown */
    UNAUTHORIZED = 401,
    /** User known, operation not permitted */
    FORBIDDEN = 403,
    /** Hide responses from 403 */
    NOT_FOUND = 404,
    /** Request known but not supported */
    METHOD_NOT_ALLOWED = 405,
    /** Request conflict with resource state ie PUT conflicts */
    CONFLICT = 409,

    // Server error codes
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
}

/**
 * An APIError class. Should be an object to facilitate instanceof checking for
 * catch.
 */
export class APIError extends Error {
    /** The API path that threw the message */
    public path?: string
    /** API Method that threw the message */
    public method?: string
    /** CTX Body that threw the message */
    public body?: any
    /** CTX Files that threw the message */
    public files?: any
    /** Server-side message */
    public verbose: string

    constructor(
        /** API Name that threw the message */
        public apiName: string,
        /** Server function that threw the message */
        public fn: string,
        /** HTTP Status code that should be returned */
        public status: HTTPStatus,
        /** Client-safe message */
        message?: string,
        /** Server-side message */
        verbose?: string
    ) {
        super(message || HTTPStatus[status])
        this.name = `APIError${status}`

        this.verbose =
            verbose || message || `${apiName}.${fn} Error ${HTTPStatus[status]}`
    }
}

/**
 * A superclass for errorable classes.
 */
export abstract class IErrorable {
    constructor(public className: string) {}

    /**
     * Creates a standard error.
     * 
     * @param fn The function that caused the error
     * @param status The status code
     * @param message Client-safe error message
     * @param verbose Full error message for administrators
     * @return An APIError
     */
    public error = (
        fn: string,
        status: HTTPStatus,
        message?: string,
        verbose?: string
    ) => new APIError(this.className, fn, status, message, verbose)

    /**
     * Creates a internal error. Uses a static client-safe message.
     * 
     * @param fn The function that caused the error
     * @param verbose Full error message for administrators
     * @return An APIError
     */
    public internal = (fn: string, verbose?: string) =>
        new APIError(
            this.className,
            fn,
            HTTPStatus.INTERNAL_SERVER_ERROR,
            'Invalid system state',
            verbose
        )
}
