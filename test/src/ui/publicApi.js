var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "Public API",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/publicApi.html")
                ),
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
                init: function(model, context) {
                    spy(model, context);
                },

                private1: function(model, context) {
                },

                private2: function(model, context) {
                },

                "@Public": {
                    public1: function(model, context, arg) {
                        spy(model, context, arg);
                    },

                    public2: function(model, context, arg) {
                        spy(model, context, arg);
                    }
                },

                private3: function(model) {
                }
            }
        );

        var publicApi = jqFixture.children().first().yellowCode("getPublicApi");
        t.equal(Object.keys(publicApi).length, 2, "only public methods");

        publicApi.public1("p1");
        publicApi.public2("p2");

        t.equal(spy.args[1][0], spy.args[0][0], "model correctly passed");
        t.ok(spy.args[1][1], "context correctly passed");
        t.equal(spy.args[1][2], "p1", "argument correctly passed");

        t.equal(spy.args[2][0], spy.args[0][0], "model correctly passed (second method)");
        t.ok(spy.args[2][1], "context correctly passed (second method)");
        t.equal(spy.args[2][2], "p2", "argument correctly passed (second method)");

        testUtil.removeFixture();

        t.end();
    }
);