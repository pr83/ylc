var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "@Init",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/init.html")
                ),
            spy = sinon.spy();

        var controller = {
            "@Init": {
                onInit: function(model, context) {
                    spy();
                }
            }
        };

        jqFixture.children().first().yellowCode(controller);

        t.equal(spy.args.length, 1, "@Init called");

        testUtil.removeFixture();

        t.end();
    }
);