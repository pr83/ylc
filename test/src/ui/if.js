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
            jqFixture.find("p:visible").length,
            2,
            "correct number of elements"
        );

        jqFixture.find("button:visible").eq(0).trigger("click");

        t.equal(
            jqFixture.find("p:visible").length,
            3,
            "correct number of elements"
        );

        jqFixture.find("button:visible").eq(1).trigger("click");

        t.equal(
            jqFixture.find("p:visible").length,
            2,
            "correct number of elements"
        );

        jqFixture.find("button:visible").eq(2).trigger("click");

        t.equal(
            jqFixture.find("p:visible").length,
            3,
            "correct number of elements"
        );

        jqFixture.find("button:visible").eq(3).trigger("click");

        t.equal(
            jqFixture.find("p:visible").length,
            2,
            "correct number of elements"
        );

        testUtil.removeFixture();

        t.end();
    }
);