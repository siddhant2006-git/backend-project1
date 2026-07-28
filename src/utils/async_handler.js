const asynchandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
      .catch((error) => next(err))
      
    }
  }







// const asynchandler = (func) => async (req, res, next) => {
//   try {
//     await fn(req,res,next)
    
//   } catch (error) {
//     res.status(error.code || 500).json
//   }

// };
