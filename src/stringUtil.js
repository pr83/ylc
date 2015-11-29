var errorUtil = require('./errorUtil');

module.exports = (function () {

    function hasSubstringAt(string, substring, index) {
        return string.substr(index, substring.length) === substring;
    }

    function echoCharacter(str, index, sbResult) {
        if (index >= str.length) {
            throw errorUtil.createError(
                "Premature end of string: '" + str + "'."
            );
        }

        if (str[index] === '\\') {
            sbResult.push(str[index]);
            index += 1;
        }

        if (index >= str.length) {
            throw errorUtil.createError(
                "Escape sequence not terminated at the end of string '" + str + "'."
            );
        }

        sbResult.push(str[index]);
        index += 1;

        return index;
    }

    return {

        isEmpty: function(string) {
            return $.trim(string).length === 0;
        },

        strGetData: function(jqElement, strDataParameterName) {
            return jqElement.attr("data-" + strDataParameterName);
        },

        hasSubstringAt: function(string, substring, index) {
            return hasSubstringAt(string, substring, index);
        }

    };

}());