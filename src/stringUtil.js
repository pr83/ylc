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

        normalizeWhitespace: function(str) {
            var WHITESPACE = /\s/,
                index = 0,
                sbResult = [];

            while (index < str.length) {
                if (str[index] === '\'') {
                    index = echoCharacter(str, index, sbResult);
                    while (index < str.length && str[index] !== '\'') {
                        index = echoCharacter(str, index, sbResult);
                    }
                    index = echoCharacter(str, index, sbResult);

                } else if (str[index] === '"') {
                    index = echoCharacter(str, index, sbResult);
                    while (index < str.length && str[index] !== '"') {
                        index = echoCharacter(str, index, sbResult);
                    }
                    index = echoCharacter(str, index, sbResult);

                } else if (str.substr(index, 2) === "/*") {
                    while (index < str.length && str.substr(index, 2) !== "*/") {
                        index += 1;
                    }
                    index += 2;

                } else if (WHITESPACE.test(str[index])) {
                    while (WHITESPACE.test(str[index])) {
                        index += 1;
                    }
                    sbResult.push(" ");

                } else {
                    index = echoCharacter(str, index, sbResult);
                }

            }

            return sbResult.join("");
        },

        hasSubstringAt: function(string, substring, index) {
            return hasSubstringAt(string, substring, index);
        }

    };

}());