const asyncHandler = (requestHandler) => {
    // Return a new function that wraps the original request handler
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

export {asyncHandler}

// one single wrapper function for all handling (its with try catch now we create it with promise one upar)

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status( error.code || 500).json ({
//             success : false,
//             message : error.message
//         })
        
//     }
// }
 