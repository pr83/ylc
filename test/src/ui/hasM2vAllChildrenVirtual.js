var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "has M2V - only virtual elements",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/hasM2vAllChildrenVirtual.html")
                );

        jqFixture.children().first().yellowCode({});
        jqFixture.children().first().yellowCode({
            makeVisible: function(model) {
                model.show = true;
            }
        });

        jqFixture.children().first().yellowCode("getAdapter").makeVisible();

        t.equals(jqFixture.find("span").text(), "hello", "m2v processed");

        testUtil.removeFixture();

        t.end();
    }
);