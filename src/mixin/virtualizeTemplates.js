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
                    strYlcIf = stringUtil.strGetData(jqNode, "ylcIf"),
                    bRemoveTag = (stringUtil.strGetData(jqNode, "ylcRemoveTag") !== undefined);

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
                    if (bRemoveTag) {
                        throw errorUtil.createError(
                            "The data-ylcRemoveTag attribute can only be used in conjunction with data-ylcIf and " +
                            "data-ylcLoop attributes.",
                            jqNode
                        );
                    }
                    
                    return false;
                }

                metadata.bRemoveTag = bRemoveTag;
                
                jqNode.removeAttr("data-ylcLoop");
                jqNode.removeAttr("data-ylcIf");

                return {
                    bMakeVirtual: true,
                    bHasV2m: false,
                    bHasM2v: true
                };

            },

            nodeEnd: function() {
                return false;
            }
        };
    }

};