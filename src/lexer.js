var stringUtil = require('./stringUtil');

module.exports = (function () {

    return {

        process: function(string, arrTokenRecognizers) {
            var idxString = 0,
                nMatchedCharacters,
                idxTokenRecognizer,
                fnTokenRecognizer,
                bMatched;

            while (idxString < string.length) {
                bMatched = false;

                for (idxTokenRecognizer = 0;
                        idxTokenRecognizer < arrTokenRecognizers.length;
                        idxTokenRecognizer += 1) {
                    fnTokenRecognizer = arrTokenRecognizers[idxTokenRecognizer];
                    nMatchedCharacters = fnTokenRecognizer(string, idxString);
                    if (nMatchedCharacters > 0) {
                        idxString += nMatchedCharacters;
                        bMatched = true;
                        break;
                    }
                }

                if (!bMatched) {
                    throw "Unrecognized token in '" + string + "' at position " + idxString + ".";
                }
            }

        },

        onDefaultToken: function(callback) {
            return function(string, idxString) {
                if (callback) {
                    callback(string.substr(idxString, 1));
                }

                return 1;
            }
        },

        onConstantToken: function(token, callback) {
            return function(string, idxString) {

                if (!stringUtil.hasSubstringAt(string, token, idxString)) {
                    return 0;
                }

                if (callback) {
                    callback(token);
                }

                return token.length;
            };
        },

        onDelimitedToken: function(opening, closing, callback) {
            return function(string, idxString) {

                var idxOpening,
                    idxClosing,
                    lenToken,
                    strToken;

                if (!stringUtil.hasSubstringAt(string, opening, idxString)) {
                    return 0;
                }

                idxOpening = idxString;
                idxClosing = string.indexOf(closing, idxOpening + opening.length);

                if (idxClosing === -1) {
                    return 0;
                }

                lenToken = (idxClosing - idxOpening) + closing.length;
                strToken = string.substr(idxString, lenToken);

                if (callback) {
                    callback(strToken);
                }

                return lenToken;
            }
        },

        onCharacterSequence: function(arrCharactersInSequence, callback) {
            return function(string, idxString) {

                var idxStringOriginal = idxString,
                    idxStringCurrent = idxString,
                    strToken;

                while ($.inArray(string.charAt(idxStringCurrent), arrCharactersInSequence) !== -1) {
                    idxStringCurrent += 1;
                }

                strToken = string.substr(idxStringOriginal, idxStringCurrent - idxStringOriginal);

                if (idxStringCurrent > idxStringOriginal && callback) {
                    callback(strToken);
                }

                return strToken.length;

            }
        }

    };

}());