var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

function installPluginToElement(jqElement, onEvent) {
    jqElement.on(
        "click",
        function() {
            onEvent("value:" + $(this).val());
        }
    );
}

test(
    "YLC events",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/ylcEvents.html")
                ),
            jqDynamicallyGeneratedElements,
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
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
                },

                installPlugin: function(model, context) {
                    installPluginToElement(
                        $(context.domElement),
                        function(text) {
                            spy(text);
                        }
                    );
                }
            }
        );

        jqFixture.find("#bAdd:visible").trigger("click").trigger("click").trigger("click");

        jqDynamicallyGeneratedElements = jqFixture.find("input:visible");

        t.equal(jqDynamicallyGeneratedElements.length, 3, "correct number of inputs");

        jqDynamicallyGeneratedElements.eq(0).val("test1");
        jqDynamicallyGeneratedElements.eq(0).trigger("click");

        jqDynamicallyGeneratedElements.eq(1).val("test2");
        jqDynamicallyGeneratedElements.eq(1).trigger("click");

        jqDynamicallyGeneratedElements.eq(2).val("test3");
        jqDynamicallyGeneratedElements.eq(2).trigger("click");

        t.equal(spy.args[0][0], "value:test1", "first value correct");
        t.equal(spy.args[1][0], "value:test2", "second value correct");
        t.equal(spy.args[2][0], "value:test3", "third value correct");

        jqFixture.find(".bRemove:visible").eq(1).trigger("click");

        jqDynamicallyGeneratedElements = jqFixture.find("input:visible");

        t.equal(jqDynamicallyGeneratedElements.length, 2, "correct number of inputs");

        jqDynamicallyGeneratedElements.eq(0).val("test4");
        jqDynamicallyGeneratedElements.eq(0).trigger("click");

        jqDynamicallyGeneratedElements.eq(1).val("test5");
        jqDynamicallyGeneratedElements.eq(1).trigger("click");

        t.equal(spy.args[3][0], "value:test4", "first value correct");
        t.equal(spy.args[4][0], "value:test5", "second value correct");

        testUtil.removeFixture();

        t.end();
    }
);