export enum HTTPStatus {
	OK = 200,
	CREATED = 201,
	// Recieved but not acted on
	ACCEPTED = 202,
	// No content, but headers are useful
	NO_CONTENT = 204,
	// Reset document
	RESET_CONTENT = 205,
	// Range header is only part of a resource
	PARTIAL_CONTENT = 206,

	// Client error and cannot process
	BAD_REQUEST = 400,
	// User unknown
	UNAUTHORIZED = 401,
	// User known, operation not permitted
	FORBIDDEN = 403,
	// Hide responses from 403
	NOT_FOUND = 404,
	// Request known but not supported
	METHOD_NOT_ALLOWED = 405,
	// Request conflict with resource state
	// ie PUT conflicts
	CONFLICT = 409,

	INTERNAL_SERVER_ERROR = 500,
	NOT_IMPLEMENTED = 501,
}

/**
 * An error object
 */
export class APIError extends Error {
	// The API path that threw the message
	public path?:string
	// API Method that threw the message
	public method?:string
	// Server-side message
	public verbose:string

	constructor(
		// API Name that threw the message
		public apiName:string,
		// Server function that threw the message
		public fn:string,
		// HTTP Status code that should be returned
		public status:HTTPStatus,
		// Client-safe message
		message?:string,
		// Server-side message
		verbose?:string,
	) {
		super(message || HTTPStatus[status])
		this.name = `APIError${status}`

		this.verbose = verbose
			|| message
			|| `${apiName}.${fn} Error ${HTTPStatus[status]}`
	}

	static error = (
		e:IErrorable,
		fn:string,
		status:HTTPStatus,
		message?:string,
		verbose?:string,
	) => new APIError(e.clazzName, fn, status, message, verbose)

	static internal = (
		e:IErrorable,
		fn:string,
		verbose?:string,
	) => new APIError(
			e.clazzName,
			fn,
			HTTPStatus.INTERNAL_SERVER_ERROR,
			'Invalid system state',
			verbose,
		)
}

/**
 * An interface denoting errorable objects
 */
export interface IErrorable {
	clazzName:string
}
