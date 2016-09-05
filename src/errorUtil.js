module.exports = (function () {

    function createError(message, element) {
        var errorObject = new Error(message);
        errorObject.element = element;
        return errorObject;
    }

    return {

        createError: function(message, element) {
            return createError(message, element);
        },

        elementToError: function(error, element) {
            if (!error.element) {
                error.element = element;
            }
            return error;
        },

        printAndRethrow: function(error) {
            if (typeof console === 'object') {
                console.error(error);
                if (error.element !== undefined) {
                    console.log(error.element);
                }
                console.log("\n");
            }

            throw error;
        },

        assert: function(condition, message) {
            if (!condition) {
                throw createError("Assertion failed: " + message);
            }
        }

    };

}());