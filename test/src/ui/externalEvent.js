var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "external event",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/externalEvent.html")
            ),
            jqButton,
            jqView;

        jqView = jqFixture.children().first().find(".view");

        jqView.yellowCode({
            init: function(model) {
                model.variable1 = "";
                model.variable2 = "";
                model.variable3 = "";
            },

            myMethod: function(model, context, arg1, arg2, arg3) {
                model.variable1 = arg1;
                model.variable2 = arg2;
                model.variable3 = arg3;
            }
        });

        jqButton = jqFixture.children().first().find("button");

        jqButton.click(function() {
            jqView.yellowCode("getAdapter").myMethod("aaa", "bbb", "ccc");
        });

        jqButton.trigger("click");

        t.equal(
            jqView.find("li:visible").text(),
            "aaabbbccc",
            "model variables correctly set"
        );

        testUtil.removeFixture();

        t.end();
    }
);