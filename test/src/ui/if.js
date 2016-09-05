var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "if",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/if.html")
            ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode({
            init: function(model) {
                model.condition = false;
            },

            flip: function(model) {
                model.condition = !(model.condition);
            }
        });

        t.equal(
            jqFixture.find("p").length,
            2,
            "correct number of elements"
        );

        jqFixture.find("button").eq(0).trigger("click");

        t.equal(
            jqFixture.find("p").length,
            3,
            "correct number of elements"
        );

        jqFixture.find("button").eq(1).trigger("click");

        t.equal(
            jqFixture.find("p").length,
            2,
            "correct number of elements"
        );

        jqFixture.find("button").eq(2).trigger("click");

        t.equal(
            jqFixture.find("p").length,
            3,
            "correct number of elements"
        );

        jqFixture.find("button").eq(3).trigger("click");

        t.equal(
            jqFixture.find("p").length,
            2,
            "correct number of elements"
        );

        testUtil.removeFixture();

        t.end();
    }
);