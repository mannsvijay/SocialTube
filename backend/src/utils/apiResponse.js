class ApiResponse {
    // statusCode: HTTP status code (e.g., 200, 201, 400)
    // data: The actual data being returned in the response
    // message: A human-readable message describing the response
    constructor(statusCode,data,message ="success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}