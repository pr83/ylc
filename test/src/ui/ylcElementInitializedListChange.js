var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "YLC element initialized - underlying list changed",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/ylcElementInitializedListChange.html")
                ),
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.list = [1];
                },

                onElementInit: function() {
                    spy();
                },

                "@Public": {
                    changeList: function(model) {
                        model.list = [1];
                    }
                }

            }
        );

        jqFixture.children().first().yellowCode("getPublicApi").changeList();

        t.equal(spy.args.length, 1, "init called only once");

        testUtil.removeFixture();

        t.end();
    }
);