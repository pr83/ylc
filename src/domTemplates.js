var stringUtil = require("./stringUtil"),
    errorUtil = require("./errorUtil"),
    domAnnotator = require('./domAnnotator'),
    virtualNodes = require('./virtualNodes');

module.exports = (function () {

    function isDynamicallyGenerated(domElement) {
        var jqElement = $(domElement);
        return jqElement.hasClass("_ylcDynamicallyGenerated") ||
            jqElement.attr("data-_ylcDynamicallyGenerated") === "true";
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

        if (!isDynamicallyGenerated(jqElement.get()) && jqElement.data("_ylcMetadata") && (jqElement.data("_ylcMetadata").ylcLoop || jqElement.data("_ylcMetadata").ylcIf)) {
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

                jqClone = jqTemplate.clone(true, true);
                jqClone.addClass("_ylcDynamicallyGenerated");
                jqClone.attr("data-_ylcDynamicallyGenerated", "true");
                domAnnotator.unmarkViewRoot(jqClone);

                reintroduceIdsInClonedSubtree(jqClone, strRewriteIdsInTemplateTo);

                return jqClone;
            }

    };

}());