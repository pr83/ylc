var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "ylcLoop causes stale list",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/ylcLoopCausesStaleList.html")
                ),
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.result = [
                        {
                            name: "Old"
                        }
                    ];
                    model.dummyCollection = [0];
                },

                reportName: function(model, context, element) {
                    spy(element.name);
                    return false;
                },

                updateValue: function(model, context) {
                    model.result = [
                        {
                            name: "New"
                        }
                    ];
                }
            }
        );

        jqFixture.find("button").trigger("click");
        jqFixture.find("a").trigger("click");

        t.equal(spy.args[0][0], "New", "updated list used");

        testUtil.removeFixture();

        t.end();
    }
);