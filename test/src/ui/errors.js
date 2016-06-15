var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "error reporting",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/errors.html")
                ),
            controller = {
                init: function(model) {
                    model.existingVariable = 0;
                    model.multilevelList = [["a", "b"]];
                    model.notAList = "notAList";
                },

                existingHandler: function(model) {
                }
            };

        t.throws(
            function() {
                jqFixture.find("#nonexistentModelVariable").yellowCode(controller);
            },
            testUtil.toRegExp("???"),
            "nonexistent model variable"
        );

        t.throws(
            function() {
                jqFixture.find("#nonexistentProperty").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Cannot find jQuery getter/setter called 'nonexistentProperty'."),
            "nonexistent property"
        );

        t.throws(
            function() {
                jqFixture.find("#nonexistentModelList").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Attempt to iterate through a non-array value: undefined"),
            "nonexistent model list"
        );

        jqFixture.find("#nonexistentEvent").yellowCode(controller);

        t.throws(
            function() {
                jqFixture.find("#nonexistentEventHandler").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Event handler 'nonExistentHandler', specified for event 'click', is not a function."),
            "nonexistent event handler"
        );

        t.throws(
            function() {
                jqFixture.find("#invalidExpression").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Premature end of binding expression: fsd!@#$"),
            "invalid expression"
        );

        t.throws(
            function() {
                jqFixture.find("#invalidProperty").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Cannot find jQuery getter/setter called '*&((&'."),
            "invalid property"
        );

        t.throws(
            function() {
                jqFixture.find("#invalidYlcBind").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Premature end of binding expression: fsdafdsfds"),
            "invalid YLC bind"
        );

        t.throws(
            function() {
                jqFixture.find("#invalidYlcBind2").yellowCode(controller);
            },
            testUtil.toRegExp("xxx"),
            "invalid YLC bind 2"
        );

        t.throws(
            function() {
                jqFixture.find("#invalidYlcBind3").yellowCode(controller);
            },
            testUtil.toRegExp("xxx"),
            "invalid YLC bind 3"
        );

        t.throws(
            function() {
                jqFixture.find("#iterationStatusUsed").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Loop status variable 'status' is already used."),
            "iteration status used"
        );

        t.throws(
            function() {
                jqFixture.find("#iterationVariableUsed").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Loop variable 'sublist' is already used."),
            "iteration variable used"
        );

        t.throws(
            function() {
                jqFixture.find("#iterationVariableNotArray").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Attempt to iterate through a non-array value: notAList"),
            "iteration variable not array"
        );

        testUtil.removeFixture();

        t.end();
    }
);