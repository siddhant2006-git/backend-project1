class ApiError extends Error{  
  constructor(
    statusCode,
    message = "Somethings is wrong ",
    errors = [],
    stack=""

  ) {
    // super - those keyword is used to the child can access for the parent data 
    super(message)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false
    this.errors = this.errors
    
    // capturestacktrace - start the error and trace the point of error and unneccessary function calls. 
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this,this,constructor)
      
    }
    }
   }


export {ApiError}