var domTemplates = require("../domTemplates"),
    stringUtil = require("../stringUtil"),
    ylcBindParser = require("../parser/ylcBind"),
    errorUtil = require("../errorUtil"),
    virtualNodes = require("../virtualNodes"),
    moustache = require("../parser/moustache");

function pushBinding(metadata, strPropertyName, strSubpropertyName, strExpression) {
    metadata.ylcBind.push(
        {
            strMappingOperator: ylcBindParser.MAPPING_BIDIRECTIONAL,
            strPropertyName: strPropertyName,
            strSubpropertyName: strSubpropertyName,
            astBindingExpression: moustache.parse(strExpression)
        }
    );
}

function getElementText(jqElement) {

    var jqElementContents = jqElement.contents(),
        jqTextElementsWithMoustache =
            jqElementContents.filter(function() {
                return this.nodeType == 3 && moustache.containsMoustache(this.nodeValue);
            });

    if (jqTextElementsWithMoustache.length === 0) {
        return;
    }

    if (jqElementContents.length > 1) {
        throw errorUtil.createError(
            "Elements containing {{...}} cannot be a part of mixed content. " +
                "Please wrap the chunk of text containing {{...}} into its own " +
                "element (e.g. <span>, <p>, <g>, etc.)",
            jqElement.get(0)
        );
    }

    return jqTextElementsWithMoustache[0].nodeValue;
}

module.exports = {

    "@DomPreprocessorFactory": function() {

        return {
            nodeStart: function(jqNode, metadata) {

                metadata.ylcBind = metadata.ylcBind || [];

                var arrAttributes = jqNode.get(0).attributes,
                    idxAttribute,
                    elementText;

                for (idxAttribute = 0; idxAttribute < arrAttributes.length; idxAttribute += 1) {
                    if (moustache.containsMoustache(arrAttributes[idxAttribute].value)) {
                        pushBinding(
                            metadata,
                            "attr",
                            arrAttributes[idxAttribute].name,
                            arrAttributes[idxAttribute].value
                        );
                    }
                }

                elementText = getElementText(jqNode);

                if (elementText) {
                    pushBinding(metadata, "text", undefined, elementText);
                }

            },

            nodeEnd: function() {
                return false;
            }
        };
    }

};