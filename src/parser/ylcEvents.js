var stringUtil = require("../stringUtil"),
    errorUtil = require('../errorUtil'),
    parseUtil = require('../parseUtil'),
    expressionParser = require('../expressionParser');

function argumentsExpressionToAsts(arrArgumentExpressions) {

    if (arrArgumentExpressions === null || arrArgumentExpressions === undefined) {
        return arrArgumentExpressions;
    }

    return $.map(
        arrArgumentExpressions,
        expressionParser.toAst
    );

}

module.exports = (function () {

    return {

        parseYlcEvents: function(strYlcEvents) {
            if (!strYlcEvents) {
                return [];
            }

            var result = [],
                arrEvents = parseUtil.normalizeWhitespace(strYlcEvents).split(";"),
                index,

                strEvent,
                arrParts,
                strEventName,
                strHandler,
                idxArgumentListStart,
                strArgumentList,
                arrArgumentExpressions,
                strMethodName,

                idxEventNameHandlerSeparator;

            for (index = 0; index < arrEvents.length; index += 1) {
                strEvent = $.trim(arrEvents[index]);

                if (strEvent) {

                    idxEventNameHandlerSeparator = strEvent.indexOf(":");
                    if (idxEventNameHandlerSeparator === -1) {
                        throw errorUtil.createError(
                            "Invalid format of the data-ylcEvents parameter: " + strYlcEvents
                        );
                    }

                    strEventName = $.trim(strEvent.substr(0, idxEventNameHandlerSeparator));
                    strHandler =
                        $.trim(
                            strEvent.substr(
                                idxEventNameHandlerSeparator + 1,
                                strEvent.length - (idxEventNameHandlerSeparator + 1)
                            )
                        );

                    idxArgumentListStart = strHandler.indexOf("(");
                    if (idxArgumentListStart === -1) {
                        strMethodName = $.trim(strHandler);
                        arrArgumentExpressions = [];

                    } else {

                        if (strHandler.charAt(strHandler.length - 1) !== ')') {
                            throw errorUtil.createError(
                                "Invalid format of the data-ylcEvents parameter: " + strYlcEvents
                            );
                        }

                        strMethodName = $.trim(strHandler.substr(0, idxArgumentListStart));
                        strArgumentList =
                            $.trim(
                                strHandler.substr(
                                    idxArgumentListStart + 1,
                                    strHandler.length - idxArgumentListStart - 2
                                )
                            );

                        if (strArgumentList.length === 0) {
                            arrArgumentExpressions = [];
                        } else {
                            arrArgumentExpressions = parseUtil.split(strArgumentList, ",");
                        }
                    }

                    result.push({
                        strEventName: strEventName,
                        strMethodName: strMethodName,
                        arrArgumentAsts: argumentsExpressionToAsts(arrArgumentExpressions)
                    });

                }
            }

            return result;
        }

    };

}());