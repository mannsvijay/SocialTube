class ApiError extends Error {

    // statusCode: HTTP status code (e.g., 400, 404, 500)
    // message: A human-readable message describing the error
    // errors: An array of specific error details (optional)
    // stack: The stack trace for debugging (optional)
    constructor(statusCode,message = "something went wrong",errors = [],stack  = ""){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

// If a stack trace is provided, use it; otherwise, capture the current stack trace
        if(stack)this.stack = stack
        else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


export {ApiError}