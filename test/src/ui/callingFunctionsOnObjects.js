var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "calling functions on objects",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/callingFunctionsOnObjects.html")
                );

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.$ = $;
                }
            }
        );

        t.equal(
            jqFixture.find("span").eq(0).text(),
            "xxx",
            "value matches"
        );

        testUtil.removeFixture();

        t.end();
    }
);