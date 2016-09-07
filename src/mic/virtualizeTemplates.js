var domTemplates = require("../domTemplates");

module.exports = {

    "@DomPreprocessorFactory": function() {
        return {
            nodeStart: function(jqNode, metadata) {
                return domTemplates.isTemplate(jqNode.get());
            },

            nodeEnd: function() {
                return false;
            }
        };
    }

};