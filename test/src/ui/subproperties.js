var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "subproperties",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/subproperties.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.color1 = "rgb(255, 0, 0)";
                    model.color2 = "rgb(0, 128, 0)";
                    model.color3 = "rgb(0, 0, 255)";
                }
            }
        );

        t.equal(
            jqFixture.find("span").eq(0).css("color"),
            "rgb(255, 0, 0)",
            "1st span has correct color"
        );

        t.equal(
            jqFixture.find("span").eq(1).css("color"),
            "rgb(0, 128, 0)",
            "2nd span has correct color"
        );

        t.equal(
            jqFixture.find("span").eq(2).css("color"),
            "rgb(0, 0, 255)",
            "3rd span has correct color"
        );

        testUtil.removeFixture();

        t.end();
    }
);