var metadata = require('./metadata');

module.exports = (function () {

    function isVirtual(jqElement) {
        return jqElement.prop("tagName").toLowerCase() === "script" &&
            jqElement.attr("type") === "ylc/virtual";
    }

    return {

        makeVirtual: function(jqElement) {

            if (isVirtual(jqElement)) {
                return jqElement;
            }

            if ( metadata.localOf(jqElement).virtualElement) {
                return metadata.localOf(jqElement).virtualElement;
            }

            var virtualElement = $("<script type='ylc/virtual'></script>"),
                originalElement = metadata.safeElementReplace(jqElement, virtualElement);
            metadata.localOf(virtualElement).originalElement = originalElement;
            metadata.localOf(originalElement).virtualElement = virtualElement;
            return virtualElement;
        },

        getOriginal: function(jqElement) {
            if (isVirtual(jqElement)) {
                return metadata.localOf(jqElement).originalElement;
            } else {
                return jqElement;
            }
        },

        getVirtual: function(jqElement) {
            var jqVirtual;
            if (isVirtual(jqElement)) {
                return jqElement;
            } else {
                jqVirtual = metadata.localOf(jqElement).virtualElement;
                return jqVirtual ? jqVirtual : jqElement;
            }
        },

        isVirtual: function(jqElement) {
            return isVirtual(jqElement);
        }

    };

}());