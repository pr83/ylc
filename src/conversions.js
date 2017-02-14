function tryParseBoolean(strBoolean) {
    if (strBoolean === "true") {
        return true;
        
    } else if (strBoolean === "false") {
        return false;
        
    } else {
        return strBoolean;
    }
}

function tryParseNumber(strNumber) {
    var fValue = parseFloat(strNumber);
    return isNaN(fValue) ? strNumber : fValue;
}

module.exports = {

    tryConversionToSameType: function(strValueToConvert, valueOfTypeToConvertTo) {
        if (typeof(valueOfTypeToConvertTo) === "boolean") {
            return tryParseBoolean(strValueToConvert);
            
        } else if (typeof(valueOfTypeToConvertTo) === "number") {
            return tryParseNumber(strValueToConvert);
            
        } else {
            return strValueToConvert;
        }
    }
    
};