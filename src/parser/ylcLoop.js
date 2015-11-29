var parseUtil = require("../parseUtil"),
    errorUtil = require('../errorUtil');

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
                strCollectionName,
                strLoopVariable,
                strStatusVariable,
                arrLoopAndStatusParts;

            if (arrParts.length !== 2) {
                throwException();
            }

            strLoopAndStatusVariables = $.trim(arrParts[0]);
            strCollectionName = $.trim(arrParts[1]);

            if (!strLoopAndStatusVariables || !strCollectionName) {
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
                strCollectionName: strCollectionName
            };
        }

    };

}());