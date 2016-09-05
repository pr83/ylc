var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "updating model",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/updatingModel.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.listOfElements = [];
                },

                addElement: function(model) {
                    var order = model.listOfElements.length + 1;
                    model.listOfElements.push({
                        text: "I am a dynamically generated string #" + order + "."
                    });
                }
            }
        );

        jqFixture.find("button").
            trigger("click").
            trigger("click").
            trigger("click");

        jqDynamicallyGeneratedElements = jqFixture.find("li");
        t.equal(
            jqDynamicallyGeneratedElements.length,
            3,
            "correct number of dynamically generated elements"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(0).text(),
            "I am a dynamically generated string #1.",
            "correct 1st element text"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(1).text(),
            "I am a dynamically generated string #2.",
            "correct 2nd element text"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(2).text(),
            "I am a dynamically generated string #3.",
            "correct 3rd element text"
        );

        testUtil.removeFixture();

        t.end();
    }
);