var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "loop at root with inputs",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/loopAtRootWithInputs.html")
                ),
            spy = sinon.spy(),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.list = [0, 0, 0, 0, 0];
                },

                printThem: function(model) {
                    var index,
                        sbPrintout = [];
                    for (index = 0; index < model.list.length; index += 1) {
                        sbPrintout.push(model.list[index] + " ");
                    }
                    spy(sbPrintout.join(""));
                }
            }
        );

        jqDynamicallyGeneratedElements = jqFixture.find("input:visible");

        jqDynamicallyGeneratedElements.eq(0).val("a");
        jqDynamicallyGeneratedElements.eq(1).val("bc");
        jqDynamicallyGeneratedElements.eq(2).val("def");
        jqDynamicallyGeneratedElements.eq(3).val("g");
        jqDynamicallyGeneratedElements.eq(4).val("h");

        jqDynamicallyGeneratedElements.eq(2).trigger("keyup");

        t.equal(spy.args[0][0], "a bc def g h ", "correct values mapped to model");

        testUtil.removeFixture();

        t.end();
    }
);