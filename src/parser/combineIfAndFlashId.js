var jsep = require("jsep");

module.exports = {

    combine: function(strFlashId, astYlcIf) {

        var astShowOnlyWhenNotFlashing = {
            type: "UnaryExpression",
            operator: "!",
            argument: {
                type: "MemberExpression",
                computed: false,
                object: {
                    type: "Identifier",
                    name: "_ylcFlash"
                },
                property: {
                    type: "Identifier",
                    name: strFlashId
                }
            },
            "prefix": true
        };
        
        if (!astYlcIf) {
            return astShowOnlyWhenNotFlashing;
        }
        
        return {
            type: "LogicalExpression",
            operator: "&&",
            left: astShowOnlyWhenNotFlashing,
            right: astYlcIf
        };

    }

};