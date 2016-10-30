var stringUtil = require("./stringUtil"),
    stringBuilderFactory = require("./stringBuilderFactory");

function newMatchResult(matchedLength, fnCallback) {
    return {
        matchedLength: matchedLength,
        fnCallback: fnCallback
    };
}

module.exports = (function () {

    return {

        process: function(string, arrTokenRecognizers, fnUnmatchedCallback) {
            var idxString = 0,
                matchResult,
                idxTokenRecognizer,
                fnTokenRecognizer,
                bMatched,
                sbUnmatched = stringBuilderFactory.newStringBuilder();

            function drainUnmatched() {
                if (sbUnmatched.isNotEmpty()) {
                    if (fnUnmatchedCallback) {
                        fnUnmatchedCallback(sbUnmatched.build());
                        sbUnmatched = stringBuilderFactory.newStringBuilder();
                    }
                }
            }

            while (idxString < string.length) {
                bMatched = false;

                for (idxTokenRecognizer = 0;
                        idxTokenRecognizer < arrTokenRecognizers.length;
                        idxTokenRecognizer += 1) {
                    fnTokenRecognizer = arrTokenRecognizers[idxTokenRecognizer];

                    matchResult = fnTokenRecognizer(string, idxString);

                    if (matchResult.matchedLength > 0) {

                        drainUnmatched();

                        if (matchResult.fnCallback) {
                            matchResult.fnCallback(string.substr(idxString, matchResult.matchedLength));
                        }
                        idxString += matchResult.matchedLength;
                        bMatched = true;
                        break;
                    }
                }

                if (!bMatched) {
                    if (fnUnmatchedCallback) {
                        sbUnmatched.append(string.substr(idxString, 1));
                        idxString += 1;
                    } else {
                        throw "Unrecognized token in '" + string + "' at position " + idxString + ".";
                    }
                }
            }

            drainUnmatched();

        },

        onDefaultToken: function(callback) {
            return function(string, idxString) {
                return newMatchResult(1, callback);
            }
        },

        onConstantToken: function(token, callback) {
            return function(string, idxString) {
                return newMatchResult(
                    stringUtil.hasSubstringAt(string, token, idxString) ? token.length : 0,
                    callback
                );
            };
        },

        onDelimitedToken: function(opening, closing, callback) {
            return function(string, idxString) {

                var idxOpening,
                    idxClosing,
                    lenToken;

                if (!stringUtil.hasSubstringAt(string, opening, idxString)) {
                    return newMatchResult(0, null);
                }

                idxOpening = idxString;
                idxClosing = string.indexOf(closing, idxOpening + opening.length);

                if (idxClosing === -1) {
                    return newMatchResult(0, null);
                }

                lenToken = (idxClosing - idxOpening) + closing.length;

                return newMatchResult(lenToken, callback);

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

                return newMatchResult(strToken.length, callback);
            }
        }

    };

}());