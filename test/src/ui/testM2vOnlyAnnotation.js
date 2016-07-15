var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "m2vOnly annotation",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/testM2vOnlyAnnotation.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.content1 = "Change me...";
                    model.content2 = "Not me...";
                },

                printContent1: function(model) {
                },

                "@M2vOnly": {
                    printContent2: function (model) {
                    }
                }
            }
        );

        jqFixture.children().first().find("#mutableField").val("new value").trigger("keyup");
        jqFixture.children().first().find("#immutableField").val("new value").trigger("keyup");

        t.equal(
            jqFixture.children().first().find("#mutableField").val(),
            "new value",
            "mutable field changed"
        );

        t.equal(
            jqFixture.children().first().find("#immutableField").val(),
            "Not me...",
            "mutable field not changed"
        );

        testUtil.removeFixture();

        t.end();
    }
);