var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "dynamic input",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/dynamicInput.html")
                ),
            jqDynamicallyGeneratedInputs;

        var controller = {
            init: function(model) {
                model.dynamicInputs = [];
                model.sum = 0;
            },

            addElement: function(model) {
                model.dynamicInputs.push({});
            },

            sumUp: function(model) {
                var sum = 0;

                for (var i = 0; i < model.dynamicInputs.length; i++) {
                    if (model.dynamicInputs[i].value) {
                        sum = sum + parseInt(model.dynamicInputs[i].value);
                    }
                }

                model.sum = sum;
            }
        };

        jqFixture.children().first().yellowCode(controller);

        jqFixture.find("#addElement").
            trigger("click").
            trigger("click").
            trigger("click");

        jqDynamicallyGeneratedInputs = jqFixture.find("input:visible");
        t.equal(jqDynamicallyGeneratedInputs.length, 3, "correct number of input fields");

        jqDynamicallyGeneratedInputs.eq(0).val("1");
        jqDynamicallyGeneratedInputs.eq(1).val("2");
        jqDynamicallyGeneratedInputs.eq(2).val("3");

        jqFixture.find("#sumUp").trigger("click");

        t.equal(
            jqFixture.find("#result").text(),
            "sum: 6",
            "result correctly calculated"
        );

        testUtil.removeFixture();

        t.end();
    }
);