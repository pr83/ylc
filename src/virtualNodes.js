module.exports = (function () {

    function isVirtual(jqElement) {
        return jqElement.prop("tagName").toLowerCase() === "script" &&
            jqElement.attr("type") === "ylc/virtual";
    }

    return {

        makeVirtual: function(jqElement) {

            if (jqElement.data("virtualElement")) {
                return jqElement.data("virtualElement");
            }

            var virtualElement = $("<script type='ylc/virtual'></script>"),
                originalElement = jqElement.replaceWith(virtualElement);
            virtualElement.data("originalElement", originalElement);
            originalElement.data("virtualElement", virtualElement);
            return virtualElement;
        },

        getOriginal: function(jqElement) {
            if (isVirtual(jqElement)) {
                return jqElement.data("originalElement");
            } else {
                return jqElement;
            }
        },

        getVirtual: function(jqElement) {
            var jqVirtual;
            if (isVirtual(jqElement)) {
                return jqElement;
            } else {
                jqVirtual = jqElement.data("virtualElement");
                return jqVirtual ? jqVirtual : jqElement;
            }
        },

        isVirtual: function(jqElement) {
            return isVirtual(jqElement);
        }

    };

}());