var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "unidirectional mapping",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/unidirectionalMapping.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode({});

        jqFixture.children().first().find("input:visible").eq(0).val("xxx").trigger("keyup");
        jqFixture.children().first().find("input:visible").eq(1).val("yyy").trigger("keyup");

        t.equal(
            jqFixture.children().first().find("input:visible").eq(2).val(),
            "xxx",
            "1st replicated input"
        );

        t.equal(
            jqFixture.children().first().find("input:visible").eq(3).val(),
            "yyy",
            "2nd replicated input"
        );

        t.equal(
            jqFixture.children().first().find("input:visible").eq(4).val(),
            "xxx yyy",
            "concatenated input"
        );

        testUtil.removeFixture();

        t.end();
    }
);