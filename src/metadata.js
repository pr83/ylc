module.exports = (function () {

    var KEY = "_ylcMetadata";

    return {
        of: function(jqElement) {
            if (!jqElement.data(KEY)) {
                jqElement.data(KEY, {});
            }

            return jqElement.data(KEY);
        },

        safeElementReplace: function(jqOriginal, jqNew) {
            var metadata = jqOriginal.data(KEY);

            jqOriginal.replaceWith(jqNew);
            if (metadata) {
                jqOriginal.data(KEY, metadata);
            }

            return jqOriginal;
        }
    };

}());