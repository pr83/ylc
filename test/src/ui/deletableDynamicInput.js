var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

function setInputValue(jqInput, value) {
    jqInput.val(value);
    jqInput.trigger("keyup");
}

test(
    "deletable dynamic input",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/deletableDynamicInput.html")
                ),
            jqAddElementButton,
            jqDynamicallyGeneratedElements,
            controller = {
                init: function(model) {
                    model.dynamicInputs = [];
                    model.sum = 0;
                },

                addElement: function(model) {
                    model.dynamicInputs.push({});
                },

                remove: function(model, context) {
                    var index = context.loopStatuses["dynamicInputStatus"].index;
                    model.dynamicInputs.splice(index, 1);
                    this.sumUp(model);
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


        jqAddElementButton = jqFixture.find("#addElement");
        jqAddElementButton.trigger("click");
        jqAddElementButton.trigger("click");

        jqDynamicallyGeneratedElements = jqFixture.find(".inputRow:visible");
        t.equal(jqDynamicallyGeneratedElements.length, 2, "correct number of input rows (2)");

        setInputValue(jqDynamicallyGeneratedElements.eq(0).find("input:visible"), 5);
        setInputValue(jqDynamicallyGeneratedElements.eq(1).find("input:visible"), 8);

        jqAddElementButton.trigger("click");
        jqAddElementButton.trigger("click");

        jqDynamicallyGeneratedElements = jqFixture.find(".inputRow:visible");
        t.equal(jqDynamicallyGeneratedElements.length, 4, "correct number of input rows (4)");

        setInputValue(jqDynamicallyGeneratedElements.eq(2).find("input:visible"), 13);
        setInputValue(jqDynamicallyGeneratedElements.eq(3).find("input:visible"), 21);

        jqDynamicallyGeneratedElements.eq(1).find("button:visible").trigger("click");

        jqDynamicallyGeneratedElements = jqFixture.find(".inputRow:visible");
        t.equal(jqDynamicallyGeneratedElements.length, 3, "correct number of input rows (3)");

        setInputValue(jqDynamicallyGeneratedElements.eq(0).find("input:visible"), 34);

        t.equal(
            jqDynamicallyGeneratedElements.eq(0).find("input:visible").val(),
            "34",
            "correct value of input 1"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(1).find("input:visible").val(),
            "13",
            "correct value of input 2"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(2).find("input:visible").val(),
            "21",
            "correct value of input 3"
        );

        t.equal(
            jqFixture.find("#result").text(),
            "68",
            "sum correct"
        );

        jqAddElementButton.trigger("click");
        jqDynamicallyGeneratedElements = jqFixture.find(".inputRow:visible");
        setInputValue(jqDynamicallyGeneratedElements.eq(3).find("input:visible"), 2);
        t.equal(
            jqFixture.find("#result").text(),
            "70",
            "sum correct after adding an additional value"
        );

        testUtil.removeFixture();

        t.end();
    }
);