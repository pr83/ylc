var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "async. model update",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/asyncModelUpdate.html")
            );

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.variable = "";
                },

                callAjax: function(model, context) {
                    model.variable = "(please wait)";
                    setTimeout(
                        function() {
                            context.updateModel(function(model) {
                                testUtil.removeFixture();
                                t.end();
                            });
                        },
                        0
                    );
                }
            }
        );

        jqFixture.find("button").trigger("click");

    }
);