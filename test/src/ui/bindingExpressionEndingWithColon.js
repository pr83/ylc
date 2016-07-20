var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "binding expression ending with colon",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/bindingExpressionEndingWithColon.html")
                );

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.value = "value";
                }
            }
        );

        t.equal(
            jqFixture.find("span:visible").eq(0).text(),
            "value",
            "value matches"
        );

        testUtil.removeFixture();

        t.end();
    }
);