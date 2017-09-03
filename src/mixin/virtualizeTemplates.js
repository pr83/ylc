var errorUtil = require('../errorUtil'),
    parseUtil = require('../parseUtil'),
    ylcLoopParser = require('../parser/ylcLoop'),
    stringUtil = require("../stringUtil"),
    expressionParser = require('../expressionParser'),
    combineIfAndFlashId = require("../parser/combineIfAndFlashId");

module.exports = {

    "@DomPreprocessorFactory": function() {
        return {
            nodeStart: function(jqNode, metadata) {

                var strYlcLoop = stringUtil.strGetData(jqNode, "ylcLoop"),
                    strYlcIf = stringUtil.strGetData(jqNode, "ylcIf"),
                    strYlcFlashId = stringUtil.strGetData(jqNode, "ylcFlashId"),
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
                }

                if (strYlcFlashId) {
                    metadata.astYlcIf = combineIfAndFlashId.combine(strYlcFlashId, metadata.astYlcIf);
                    metadata.flashIdDefined = true;
                }

                metadata.bRemoveTag = bRemoveTag;
                
                jqNode.removeAttr("data-ylcLoop");
                jqNode.removeAttr("data-ylcIf");
                jqNode.removeAttr("data-ylcFlashId");

                if (!metadata.ylcLoop && !metadata.astYlcIf) {
                    return false;
                }
                
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