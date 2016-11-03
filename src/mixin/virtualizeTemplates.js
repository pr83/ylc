var errorUtil = require('../errorUtil'),
    parseUtil = require('../parseUtil'),
    domTemplates = require("../domTemplates"),
    ylcLoopParser = require('../parser/ylcLoop'),
    stringUtil = require("../stringUtil"),
    expressionParser = require('../expressionParser');

module.exports = {

    "@DomPreprocessorFactory": function() {
        return {
            nodeStart: function(jqNode, metadata) {

                var strYlcLoop = stringUtil.strGetData(jqNode, "ylcLoop"),
                    strYlcIf = stringUtil.strGetData(jqNode, "ylcIf");

                if (strYlcLoop && strYlcIf) {
                    throw errorUtil.createError(
                        "An element can't contain both data-ylcLoop and data-ylcIf. " +
                        "Please use an embedded DIV.",
                        jqNode
                    );
                }

                if (strYlcLoop) {
                    metadata.ylcLoop = ylcLoopParser.parseYlcLoop(strYlcLoop);

                } else if (strYlcIf) {
                    metadata.astYlcIf = expressionParser.toAst(parseUtil.normalizeWhitespace(strYlcIf));

                } else {
                    return false;
                }

                jqNode.removeAttr("data-ylcLoop");
                jqNode.removeAttr("data-ylcIf");

                return true;

            },

            nodeEnd: function() {
                return false;
            }
        };
    }

};