var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "controller methods",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/controllerMethods.html")
                ),
            spy = sinon.spy(),
            mixin = {
                mixinMethod: function() {
                    return "mixinMethodResult";
                }
            },
            controller = {
                init: function(model, context) {
                    spy(context.controllerMethods.mixinMethod());
                    spy(context.controllerMethods.controllerMethod());
                },

                controllerMethod: function() {
                    return "controllerMethodResult";
                }
            };

        jqFixture.children().first().yellowCode([controller, mixin]);

        t.equal(spy.args[0][0], "mixinMethodResult", "mixin method called");
        t.equal(spy.args[1][0], "controllerMethodResult", "controller method called");

        testUtil.removeFixture();

        t.end();
    }
);