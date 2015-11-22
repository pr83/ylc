var errorUtil = require('./errorUtil');

module.exports = (function () {

    return {

        checkObjectSanity: function(objectValue) {
            if (objectValue === null || objectValue === undefined) {
                throw errorUtil.createError("Left hand side of the '.' operator must not be null/undefined.");
            }
        },

        checkArraySanity: function(arrayValue) {
            if (arrayValue === null || arrayValue === undefined) {
                throw errorUtil.createError("Left hand side of the '[]' operator must not be null/undefined.");
            }
        }

    };

}());