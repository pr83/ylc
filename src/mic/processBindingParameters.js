var domTemplates = require("../domTemplates"),
    stringUtil = require("../stringUtil"),
    ylcBindParser = require("../parser/ylcBind"),
    errorUtil = require("../errorUtil"),
    virtualNodes = require("../virtualNodes");

module.exports = {

    "@DomPreprocessorFactory": function() {

        return {
            nodeStart: function(jqNode, metadata) {
                var strYlcBind = stringUtil.strGetData(jqNode, "ylcBind");
                metadata.ylcBind = ylcBindParser.parseYlcBind(strYlcBind);
                jqNode.removeAttr("data-ylcBind");
                return false;
            },

            nodeEnd: function() {
                return false;
            }
        };
    }

};