const errorHandler = (statusCode = 500, message = "An error occurred", type = "Generic Error", details = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.type = type; 
    error.details = details; 
    return error;
};

module.exports = errorHandler;
