var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "compare null",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/compareNull.html")
            );

        jqFixture.children().first().yellowCode({
            init: function(model) {
                model.toCompare = null;
            }
        });

        t.equal(
            jqFixture.find("span").text(),
            "is null",
            "should evaluate to true"
        );

        testUtil.removeFixture();

        t.end();
    }
);