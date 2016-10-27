var domUtil = require("./domUtil");

module.exports = (function () {

    var SHARED_METADATA_KEY = "_ylcMetadata",
        LOCAL_METADATA_KEY = "_ylcNodeSpecificMetadata";

    return {

        of: function(jqElement) {
            if (!jqElement.data(SHARED_METADATA_KEY)) {
                jqElement.data(SHARED_METADATA_KEY, {});
            }

            return jqElement.data(SHARED_METADATA_KEY);
        },

        localOf: function(jqElement) {
            if (!jqElement.data(LOCAL_METADATA_KEY)) {
                jqElement.data(LOCAL_METADATA_KEY, {});
            }

            return jqElement.data(LOCAL_METADATA_KEY);
        },

        safeElementReplace: function(jqOriginal, jqNew) {
            var metadata = jqOriginal.data(SHARED_METADATA_KEY);

            jqOriginal.replaceWith(jqNew);
            if (metadata) {
                jqOriginal.data(SHARED_METADATA_KEY, metadata);
            }

            return jqOriginal;
        },

        safeClone: function(jqTemplate) {

            var domClone =
                domUtil.clone(
                    jqTemplate.get(0),
                    function(domOriginal, domClone) {

                        $(domClone).data(
                            SHARED_METADATA_KEY,
                            $(domOriginal).data(SHARED_METADATA_KEY)
                        );

                        if ($(domOriginal).data(LOCAL_METADATA_KEY)) {
                            $(domClone).data(
                                LOCAL_METADATA_KEY,
                                $.extend(true, {}, $(domOriginal).data(LOCAL_METADATA_KEY))
                            );
                        }
                    }
                );

            return $(domClone);

        }

    };

}());