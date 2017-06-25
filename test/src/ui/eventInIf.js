var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "event in if",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/eventInIf.html")
            ),
            spy = sinon.spy();

        jqFixture.children().first().yellowCode({
            init: function(model) {
                model.condition = false;
            },

            "@Public": {
                conditionToTrue: function(model) {
                    model.condition = true;
                }
            },
            
            doSomething: function() {
                spy("didSomething");
            }
            
        });

        var publicApi = jqFixture.children().first().yellowCode("getPublicApi");
        console.log(publicApi);
        publicApi.conditionToTrue();
        jqFixture.find("button").trigger("click");
        
        t.equal(
            spy.args[0][0],
            "didSomething",
            "event triggered"
        );

        testUtil.removeFixture();

        t.end();
    }
);