var virtualNodes = require('./virtualNodes'),
    metadata = require('./metadata');

module.exports = (function () {

    return {
        markViewRoot: function(jqElement) {
            metadata.localOf(virtualNodes.getOriginal(jqElement)).viewRoot = true;
        },

        unmarkViewRoot: function(jqElement) {
            metadata.localOf(virtualNodes.getOriginal(jqElement)).viewRoot = false;
        },

        isViewRoot: function(jqElement) {
            return metadata.localOf(virtualNodes.getOriginal(jqElement)).viewRoot;
        },

        markTemplateIdsChecked: function(jqElement) {
            metadata.localOf(virtualNodes.getOriginal(jqElement)).templateIdsChecked = true;
        },

        areTemplateIdsChecked: function(jqElement) {
            return metadata.localOf(virtualNodes.getOriginal(jqElement)).templateIdsChecked;
        }

    };

}());