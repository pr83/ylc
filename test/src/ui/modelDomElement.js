var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "model DOM element",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/modelDomElement.html")
                ),
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.paragraph1 = model.paragraph2 = null;
                },

                print: function(model, context) {
                    spy(model.paragraph1, model.paragraph2);
                }
            }
        );

        jqFixture.find("button").trigger("click");

        t.ok($(spy.args[0][0]).is(jqFixture.find("p").eq(0)), "first element");
        t.ok($(spy.args[0][1]).is(jqFixture.find("p").eq(1)), "second element");
        testUtil.removeFixture();

        t.end();
    }
);