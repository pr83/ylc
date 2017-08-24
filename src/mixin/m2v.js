var domTemplates = require("../domTemplates"),
    stringUtil = require("../stringUtil"),
    ylcBindParser = require("../parser/ylcBind"),
    errorUtil = require("../errorUtil"),
    virtualNodes = require("../virtualNodes"),
    conversions = require("../conversions");

var PREFIELD = {};

function createM2v(currentYlcBinding) {

    return function (domElement, context) {

        var jqNode = $(domElement),
            value,
            existingValue;

        var fnGetterSetter = jqNode[currentYlcBinding.strPropertyName];
        if (!(fnGetterSetter instanceof Function)) {
            throw errorUtil.createError(
                "Cannot find jQuery getter/setter called '" +
                currentYlcBinding.strPropertyName + "'.",
                domElement
            );
        }

        try {
            value = context.getValue(currentYlcBinding.astBindingExpression);

        } catch (err) {
            throw errorUtil.elementToError(err, domElement);
        }

        if (value !== PREFIELD) {

            if (currentYlcBinding.strSubpropertyName === undefined) {
                existingValue = fnGetterSetter.call(jqNode);

            } else {
                existingValue =
                    fnGetterSetter.call(jqNode, currentYlcBinding.strSubpropertyName);
            }
            
            if (value !== conversions.tryConversionToSameType(existingValue, value)) {
                
                if (currentYlcBinding.strSubpropertyName === undefined) {
                    fnGetterSetter.call(jqNode, value);

                } else {
                    fnGetterSetter.call(
                        jqNode,
                        currentYlcBinding.strSubpropertyName,
                        value
                    );
                }
                
                return true;
            }
        }
        
        return false;

    }
}

module.exports = {

    "@DomPreprocessorFactory": function() {

        return {
            nodeStart: function(jqNode, metadata) {

                metadata.m2v = metadata.m2v || [];

                var arrYlcBind = metadata.ylcBind,
                    idxYlcBind,
                    currentYlcBinding,
                    bHasM2v = false;

                for (idxYlcBind = 0; idxYlcBind < arrYlcBind.length; idxYlcBind += 1) {
                    currentYlcBinding = arrYlcBind[idxYlcBind];

                    if (currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_BIDIRECTIONAL &&
                        currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_M2V_ONLY) {
                        continue;
                    }

                    // an empty property maps straight to the DOM element, which is read only
                    if (stringUtil.isEmpty(currentYlcBinding.strPropertyName)) {
                        continue;
                    }

                    metadata.m2v.push(createM2v(currentYlcBinding));
                    bHasM2v = true;

                }

                return {
                    bMakeVirtual: false,
                    bHasV2m: false,
                    bHasM2v: bHasM2v
                };

            },

            nodeEnd: function() {
                return false;
            }
        };
    },

    PREFIELD: PREFIELD

};