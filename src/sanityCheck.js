var errorUtil = require('./errorUtil');

module.exports = (function () {

    return {

        checkObjectSanity: function(objectValue) {
            if (!$.isPlainObject(objectValue) && !$.isArray(objectValue)) {
                throw errorUtil.createError("Left hand side of the '.' operator must be an object or array.");
            }
        },

        checkArraySanity: function(arrayValue) {
            if (!$.isPlainObject(arrayValue) && !$.isArray(arrayValue)) {
                throw errorUtil.createError("The [] operator can only be used on arrays and objects.");
            }
        }

    };

}());