var test = require("tape"),
    conversions = require('../../../src/conversions');

test(
    "unit test: conversions",
    function (t) {
        
        t.equals(false, conversions.tryConversionToSameType("false", true));
        t.equals(true, conversions.tryConversionToSameType("true", true));
        t.equals("different", conversions.tryConversionToSameType("different", true));
        t.equals(undefined, conversions.tryConversionToSameType(undefined, true));

        t.equals(10, conversions.tryConversionToSameType("10", 5));
        t.equals(10.2, conversions.tryConversionToSameType("10.2", 5));
        t.equals("different", conversions.tryConversionToSameType("different", 5));
        t.equals(undefined, conversions.tryConversionToSameType(undefined, 5));

        t.equals("true", conversions.tryConversionToSameType("true", "x"));
        t.equals("5", conversions.tryConversionToSameType("5", "x"));
        t.equals("different", conversions.tryConversionToSameType("different", "x"));
        t.equals(undefined, conversions.tryConversionToSameType(undefined, "x"));

        t.equals("true", conversions.tryConversionToSameType("true", undefined));
        t.equals("5", conversions.tryConversionToSameType("5", undefined));
        t.equals("different", conversions.tryConversionToSameType("different", undefined));
        t.equals(undefined, conversions.tryConversionToSameType(undefined, undefined));

        t.end();

    }

);