var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "whitespace",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/whitespace.html")
                ),
            spy = sinon.spy(),
            jqDynamicallyGeneratedElements;

        var controller = {
            init: function (model) {
                model.color = "rgb(255, 0, 0)";
                model.elements = [1, 2, 3, 4, 5, 6, 7];
                model.trueVariable = true;
                model.falseVariable = false;
            },

            doSomething: function() {
                spy();
            }

        };

        jqFixture.children().first().find("#bind").yellowCode(controller);
        t.equal(
            jqFixture.children().first().find("#bind").css("color"),
            "rgb(255, 0, 0)",
            "ylcBind working correctly"
        );

        jqFixture.children().first().find("#events").yellowCode(controller).trigger("click");
        t.ok(spy.calledOnce, "ylcEvents working correctly");

        jqFixture.children().first().find("#loop").yellowCode(controller);
        t.equal(
            jqFixture.children().first().find("#loop").find("div").length,
            7,
            "ylcLoop working correctly"
        );

        jqFixture.children().first().find("#if").yellowCode(controller);
        jqDynamicallyGeneratedElements =
            jqFixture.children().first().find("#if").find("span");
        t.equal(
            jqDynamicallyGeneratedElements.eq(0).attr("id"),
            "trueSpan",
            "ylcLoop working correctly - showing true"
        );
        t.equal(
            jqDynamicallyGeneratedElements.length,
            1,
            "ylcIf working correctly - not showing false"
        );

        testUtil.removeFixture();

        t.end();
    }
);