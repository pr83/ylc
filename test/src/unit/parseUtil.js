var test = require("tape"),
    testUtil = require("../common/testUtil"),
    parseUtil = require('../../../src/parseUtil');

testUtil.setUp();

test(
    "unit: parseUtil",
    function (t) {

        var arrPartsBySemicolon,
            arrPartsByComma;

        arrPartsBySemicolon =
            parseUtil.split(
                "click: abc('x/*must be*/', 'y/*must be*/', 531, /*comment*/ 5); \n" +
                    "\t\thover: def('z')",
                ";"
            );

        t.equal(2, arrPartsBySemicolon.length, "splitting by semicolon (parts count)");

        t.equal(
            arrPartsBySemicolon[0],
            "click: abc('x/*must be*/', 'y/*must be*/', 531,  5)",
            "splitting by semicolon (part 1)"
        );

        t.equal(
            arrPartsBySemicolon[1],
            " hover: def('z')",
            "splitting by semicolon (part 2)"
        );


        arrPartsByComma =
            parseUtil.split(
                "'x/*must be*/', 'y/*must be*/', 531, /*comment*/ 5",
                ","
            );

        t.equal(4, arrPartsByComma.length, "splitting by comma (parts count)");

        t.equal(
            arrPartsByComma[0],
            "'x/*must be*/'",
            "splitting by comma (part 1)"
        );

        t.equal(
            arrPartsByComma[1],
            " 'y/*must be*/'",
            "splitting by comma (part 2)"
        );

        t.equal(
            arrPartsByComma[2],
            " 531",
            "splitting by comma (part 3)"
        );

        t.equal(
            arrPartsByComma[3],
            "  5",
            "splitting by comma (part 4)"
        );

        t.end();

    }
);