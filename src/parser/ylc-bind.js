var stringUtil = require("../stringUtil"),
    errorUtil = require('../errorUtil');

module.exports = (function () {

    var MAPPING_BIDIRECTIONAL = ":",
        MAPPING_V2M_ONLY = "->",
        MAPPING_V2M_ONLY_FORCED = "=>",
        MAPPING_M2V_ONLY = "<-";

    function poke(strSearchIn, intSearchAt, arrSearchFor) {
        var strSearchFor,
            idxSearchFor;

        for (idxSearchFor = 0; idxSearchFor < arrSearchFor.length; idxSearchFor += 1) {
            strSearchFor = arrSearchFor[idxSearchFor];
            if (strSearchIn.substr(intSearchAt, strSearchFor.length) === strSearchFor) {
                return strSearchFor;
            }
        }

        return "";

    }

    function pokeMappingOperator(strYlcBind, index) {
        return poke(
            strYlcBind,
            index,
            [
                MAPPING_BIDIRECTIONAL,
                MAPPING_V2M_ONLY,
                MAPPING_V2M_ONLY_FORCED,
                MAPPING_M2V_ONLY
            ]
        );
    }

    function readPropertyAndSubproperty(strYlcBind, index, sbPropertyAndSubproperty) {
        while (index < strYlcBind.length && pokeMappingOperator(strYlcBind, index) === "") {

            if (strYlcBind[index] === "\\" && index + 1 < strYlcBind.length) {
                sbPropertyAndSubproperty.push(strYlcBind[index + 1]);
                index += 2;

            } else {
                sbPropertyAndSubproperty.push(strYlcBind[index]);
                index += 1;
            }

        }

        if (index === strYlcBind.length) {
            throw errorUtil.createError("Premature end of binding expression: " + strYlcBind);
        }

        return index;
    }

    function readExpression(strYlcBind, index, sbExpression) {
        while (index < strYlcBind.length && strYlcBind[index] !== ";") {
            sbExpression.push(strYlcBind[index]);
            index += 1;
        }

        return index;
    }

    function pushBinding(sbPropertyAndSubproperty, sbExpression, strMappingOperator, result) {

        var strPropertyAndSubproperty = $.trim(sbPropertyAndSubproperty.join("")),
            strPropertyName,
            strSubpropertyName;

        if (strPropertyAndSubproperty.indexOf(".") < 0) {
            strPropertyName = strPropertyAndSubproperty;
            strSubpropertyName = undefined;

        } else {
            strPropertyName = $.trim(strPropertyAndSubproperty.split(".")[0]);
            strSubpropertyName = $.trim(strPropertyAndSubproperty.split(".")[1]);
        }

        result.push({
            strPropertyName: strPropertyName,
            strSubpropertyName: strSubpropertyName,
            strMappingOperator: strMappingOperator,
            strBindingExpression: $.trim(sbExpression.join(""))
        });

    }


    return {

        MAPPING_BIDIRECTIONAL: MAPPING_BIDIRECTIONAL,
        MAPPING_V2M_ONLY: MAPPING_V2M_ONLY,
        MAPPING_V2M_ONLY_FORCED: MAPPING_V2M_ONLY_FORCED,
        MAPPING_M2V_ONLY: MAPPING_M2V_ONLY,



        parseYlcBind: function(strYlcBind) {

            var result = [],
                index = 0,
                sbPropertyAndSubproperty,
                strMappingOperator,
                sbExpression;

            if (!strYlcBind) {
                return [];
            }

            strYlcBind = stringUtil.normalizeWhitespace(strYlcBind);

            while (index < strYlcBind.length) {

                sbPropertyAndSubproperty = [];
                index = readPropertyAndSubproperty(strYlcBind, index, sbPropertyAndSubproperty);

                strMappingOperator = pokeMappingOperator(strYlcBind, index);
                index += strMappingOperator.length;

                sbExpression = [];
                index = readExpression(strYlcBind, index, sbExpression);

                pushBinding(sbPropertyAndSubproperty, sbExpression, strMappingOperator, result);

                if (strYlcBind[index] === ";") {
                    index += 1;
                }

                // skip trailing white space
                while (index < strYlcBind.length && /\s/.test(strYlcBind[index])) {
                    index += 1;
                }

            }

            return result;

        }

    };

}());