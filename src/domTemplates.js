var stringUtil = require("./stringUtil"),
    domAnnotator = require('./domAnnotator');

module.exports = (function () {

    function isDynamicallyGenerated(domElement) {
        var jqElement = $(domElement);
        return jqElement.hasClass("_ylcDynamicallyGenerated") ||
            jqElement.attr("data-_ylcDynamicallyGenerated") === "true";
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

        jqCreateElementFromTemplate: function (jqTemplate) {
            var jqClone = jqTemplate.clone();
            jqClone.addClass("_ylcDynamicallyGenerated");
            domAnnotator.unmarkViewRoot(jqClone);
            jqClone.attr("data-_ylcDynamicallyGenerated", "true");

            return jqClone;
        }

    };

}());