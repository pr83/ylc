var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "parametrized event handlers",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/parametrizedEventHandlers.html")
                ),
            spy = sinon.spy(),
            jqButtons;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.sequence = ["one", "two", "three", "four", "five"];
                },

                doSomething: function() {
                    spy("No parameters");
                },

                doSomethingElse: function(model, context, parameter1, parameter2, parameter3, parameter4) {
                    spy(parameter1, parameter2, parameter3 , parameter4);
                }
            }
        );

        jqFixture.children().first().find("button").trigger("click");

        t.deepEqual(spy.args[0], ["element initialized", 2, "one", 0], "element 1 initialization");
        t.deepEqual(spy.args[1], ["element initialized", 2, "two", 1], "element 2 initialization");
        t.deepEqual(spy.args[2], ["element initialized", 2, "three", 2], "element 3 initialization");
        t.deepEqual(spy.args[3], ["element initialized", 2, "four", 3], "element 4 initialization");
        t.deepEqual(spy.args[4], ["element initialized", 2, "five", 4], "element 5 initialization");

        t.deepEqual(spy.args[5], ["No parameters"], "no parameter button click");

        t.deepEqual(spy.args[6], ["button pressed", 1, "one", 0], "button 1 event with parameters");
        t.deepEqual(spy.args[7], ["button pressed", 1, "two", 1], "button 2 event with parameters");
        t.deepEqual(spy.args[8], ["button pressed", 1, "three", 2], "button 3 event with parameters");
        t.deepEqual(spy.args[9], ["button pressed", 1, "four", 3], "button 4 event with parameters");
        t.deepEqual(spy.args[10], ["button pressed", 1, "five", 4], "button 5 event with parameters");

        testUtil.removeFixture();

        t.end();
    }
);