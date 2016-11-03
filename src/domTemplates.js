var stringUtil = require("./stringUtil"),
    errorUtil = require("./errorUtil"),
    domAnnotator = require('./domAnnotator'),
    virtualNodes = require('./virtualNodes'),
    metadata = require('./metadata');

module.exports = (function () {

    function isDynamicallyGenerated(domElement) {
        return metadata.localOf($(domElement)).dynamicallyGenerated;
    }

    function findIncludingRoot(jqElement, selector) {
        return jqElement.filter(selector).add(jqElement.find(selector));
    }

    function checkOrRewriteTemplateIds(jqTemplate, bReportErrorOnId, strRewriteIdsInTemplateTo) {
        var jqTemplateElementsWithIds;

        if (!domAnnotator.areTemplateIdsChecked(jqTemplate)) {
            jqTemplateElementsWithIds =  findIncludingRoot(jqTemplate, "[id]");
            if (jqTemplateElementsWithIds.length > 0) {
                if (bReportErrorOnId) {
                    throw errorUtil.createError(
                        "Loop templates cannot contain elements with IDs, " +
                        "because looping would create multiple elements with the same ID.",
                        jqTemplateElementsWithIds.get(0)
                    );
                } else {
                    jqTemplateElementsWithIds.each(function(){
                        var id = $(this).attr("id");
                        $(this).removeAttr("id");
                        $(this).attr(strRewriteIdsInTemplateTo, id);
                    });
                }
            }
            domAnnotator.markTemplateIdsChecked(jqTemplate);
        }
    }

    function reintroduceIdsInClonedSubtree(jqRoot, strRewriteIdsFrom) {
        var jqTemplateElementsWithIds = findIncludingRoot(jqRoot, "[" + strRewriteIdsFrom + "]");
        jqTemplateElementsWithIds.each(function() {
            $(this).attr("id", $(this).attr(strRewriteIdsFrom));
        });
    }

    function isTemplate(jqElement) {
        var strYlcLoop = stringUtil.strGetData(jqElement, "ylcLoop"),
            strIf = stringUtil.strGetData(jqElement, "ylcIf");

        if (!isDynamicallyGenerated(jqElement.get()) && (metadata.of(jqElement).ylcLoop || metadata.of(jqElement).astYlcIf)) {
            return true;
        }

        return (strYlcLoop || strIf) && !isDynamicallyGenerated(jqElement.get());
    }

    return {

        isDynamicallyGenerated: function (domElement) {
            return isDynamicallyGenerated(domElement);
        },

        makeTemplateVirtual: function(jqElement) {
            if (!isTemplate(jqElement)) {
                return jqElement;

            } else {
                return virtualNodes.makeVirtual(jqElement);
            }
        },

        isTemplate: function (domElement) {
            return isTemplate(virtualNodes.getOriginal($(domElement)));
        },

        jqCreateElementFromTemplate:
            function (jqTemplate, bReportErrorOnId, strRewriteIdsInTemplateTo) {

                var jqClone;

                checkOrRewriteTemplateIds(
                    jqTemplate,
                    bReportErrorOnId,
                    strRewriteIdsInTemplateTo
                );

                jqClone = metadata.safeClone(jqTemplate);

                metadata.localOf(jqClone).dynamicallyGenerated = true;

                domAnnotator.unmarkViewRoot(jqClone);

                reintroduceIdsInClonedSubtree(jqClone, strRewriteIdsInTemplateTo);

                return jqClone;
            }

    };

}());