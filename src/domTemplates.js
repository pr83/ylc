var stringUtil = require("./stringUtil"),
    errorUtil = require("./errorUtil"),
    domAnnotator = require('./domAnnotator');

module.exports = (function () {

    function isDynamicallyGenerated(domElement) {
        var jqElement = $(domElement);
        return jqElement.hasClass("_ylcDynamicallyGenerated") ||
            jqElement.attr("data-_ylcDynamicallyGenerated") === "true";
    }

    function checkOrRewriteTemplateIds(jqTemplate, bReportErrorOnId, strRewriteIdsInTemplateTo) {
        var jqTemplateElementsWithIds;

        if (!domAnnotator.areTemplateIdsChecked(jqTemplate)) {
            jqTemplateElementsWithIds = jqTemplate.find("[id]");
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
        var jqTemplateElementsWithIds = jqRoot.find("[" + strRewriteIdsFrom + "]");
        jqTemplateElementsWithIds.each(function() {
            $(this).attr("id", $(this).attr(strRewriteIdsFrom));
        });
    }

    return {

        isDynamicallyGenerated: function (domElement) {
            return isDynamicallyGenerated(domElement);
        },

        isTemplate: function (domElement) {
            var jqElement = $(domElement),
                strYlcLoop = stringUtil.strGetData(jqElement, "ylcLoop"),
                strIf = stringUtil.strGetData(jqElement, "ylcIf");

            return (strYlcLoop || strIf) ?
                !isDynamicallyGenerated(domElement) :
                false;
        },

        jqCreateElementFromTemplate:
            function (jqTemplate, bReportErrorOnId, strRewriteIdsInTemplateTo) {

                var jqClone;

                checkOrRewriteTemplateIds(
                    jqTemplate,
                    bReportErrorOnId,
                    strRewriteIdsInTemplateTo
                );

                jqClone = jqTemplate.clone();
                jqClone.addClass("_ylcDynamicallyGenerated");
                jqClone.attr("data-_ylcDynamicallyGenerated", "true");
                domAnnotator.unmarkViewRoot(jqClone);

                reintroduceIdsInClonedSubtree(jqClone, strRewriteIdsInTemplateTo);

                return jqClone;
            }

    };

}());