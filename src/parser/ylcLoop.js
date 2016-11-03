var parseUtil = require("../parseUtil"),
    errorUtil = require('../errorUtil'),
    expressionParser = require('../expressionParser');

module.exports = (function () {

    return {

        parseYlcLoop: function (strYlcLoop) {
            var throwException = function () {
                    throw errorUtil.createError(
                        "Invalid format of the data-ylcLoop parameter: " + strYlcLoop
                    );
                },
                arrParts = parseUtil.normalizeWhitespace(strYlcLoop).split(":"),
                strLoopAndStatusVariables,
                strCollection,
                strLoopVariable,
                strStatusVariable,
                arrLoopAndStatusParts;

            if (arrParts.length !== 2) {
                throwException();
            }

            strLoopAndStatusVariables = $.trim(arrParts[0]);
            strCollection = $.trim(arrParts[1]);

            if (!strLoopAndStatusVariables || !strCollection) {
                throwException();
            }

            if (strLoopAndStatusVariables.indexOf(",") < 0) {
                strLoopVariable = strLoopAndStatusVariables;

            } else {
                arrLoopAndStatusParts = strLoopAndStatusVariables.split(",");
                if (arrLoopAndStatusParts.length !== 2) {
                    throwException();
                }
                strLoopVariable = $.trim(arrLoopAndStatusParts[0]);
                strStatusVariable = $.trim(arrLoopAndStatusParts[1]);
            }

            return {
                strLoopVariable: strLoopVariable,
                strStatusVariable: strStatusVariable,
                astCollection: expressionParser.toAst(strCollection)
            };
        }

    };

}());