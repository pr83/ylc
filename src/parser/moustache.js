var lexer = require("../lexer"),
    parseUtil = require("../parseUtil"),
    jsep = require("jsep"),

    LEFT_MOUSTACHE_DELIMITER = "{{",
    RIGHT_MOUSTACHE_DELIMITER = "}}",
    LEFT_TR_MOUSTACHE_DELIMITER = "@{{",
    RIGHT_TR_MOUSTACHE_DELIMITER = "}}";

function containsDelimited(strToTest, strOpening, strClosing) {
    var idxOpening = strToTest.indexOf(strOpening),
        idxClosing = strToTest.indexOf(strClosing);

    return idxOpening !== -1 && idxClosing !== -1 && (idxClosing - idxOpening >= strOpening.length);
}

function stringToAst(str) {
    return jsep("'" + str + "'");
}

function addAstToAst(astLeft, astRight) {

    if (!astLeft) {
        return astRight;
    }

    return {
        type: "BinaryExpression",
        operator: "+",
        left: astLeft,
        right: astRight
    };

}

function addStringToAst(astLeft, strRight) {

    if (!astLeft) {
        return stringToAst(strRight);
    }

    return addAstToAst(astLeft, stringToAst(strRight));
}

function createTrAst(strTrExpression) {
    var arrParts = parseUtil.split(strTrExpression, ","),
        strKey = arrParts[0],
        arrArguments = arrParts.slice(1),
        astResult;

    if (arrArguments.length === 0) {
        astResult = jsep("translate('" + strKey + "')");
    } else {
        astResult = jsep("translate('" + strKey + "', " + arrArguments.join(", ") + ")");
    }

    return astResult;

}

module.exports = {

    containsMoustache: function(strToTest) {
        return containsDelimited(strToTest, LEFT_MOUSTACHE_DELIMITER, RIGHT_MOUSTACHE_DELIMITER) ||
               containsDelimited(strToTest, LEFT_TR_MOUSTACHE_DELIMITER, RIGHT_TR_MOUSTACHE_DELIMITER);
    },

    parse: function(strExpressionWithMoustache) {

        var astResult = null;

        lexer.process(
            strExpressionWithMoustache,
            [
                lexer.onDelimitedToken(
                    LEFT_MOUSTACHE_DELIMITER,
                    RIGHT_MOUSTACHE_DELIMITER,
                    function(strToken) {
                        var strExpression =
                                strToken.substring(
                                    LEFT_MOUSTACHE_DELIMITER.length,
                                    strToken.length - RIGHT_MOUSTACHE_DELIMITER.length
                                );
                        astResult = addAstToAst(astResult, jsep(strExpression));
                    }
                ),

                lexer.onDelimitedToken(
                    LEFT_TR_MOUSTACHE_DELIMITER,
                    RIGHT_TR_MOUSTACHE_DELIMITER,
                    function(strToken) {
                        var strTrExpression =
                            strToken.substring(
                                LEFT_TR_MOUSTACHE_DELIMITER.length,
                                strToken.length - RIGHT_TR_MOUSTACHE_DELIMITER.length
                            );
                        astResult = addAstToAst(astResult, createTrAst(strTrExpression));
                    }
                )
            ],
            function (strUnmatchedToken) {
                astResult = addStringToAst(astResult, strUnmatchedToken);
            }
        );

        return astResult;

    }

};