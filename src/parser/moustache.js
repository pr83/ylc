var lexer = require('../lexer'),
    jsep = require("jsep"),

    LEFT_MOUSTACHE_DELIMITER = "{{",
    RIGHT_MOUSTACHE_DELIMITER = "}}";

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

module.exports = {

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
                        console.log("strToken", strToken);
                        console.log("strExpression", strExpression);
                        astResult = addAstToAst(astResult, jsep(strExpression));
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