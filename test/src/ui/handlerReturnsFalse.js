var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "handler returns false",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/handlerReturnsFalse.html")
                ),
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
                init: function(){},

                handlerReturningTrue: function(model, context) {
                    return true;
                },

                handlerReturningFalse: function(model, context) {
                    return false;
                }
            }
        );

        jqFixture.on(
            "click",
            function() {
                spy();
            }
        );

        jqFixture.find("span").eq(0).click();
        t.equal(spy.callCount, 1, "after 1st click");

        jqFixture.find("span").eq(1).click();
        t.equal(spy.callCount, 1, "after 2nd click");

        jqFixture.find("span").eq(1).click();
        t.equal(spy.callCount, 1, "after 3rd click");

        jqFixture.find("span").eq(0).click();
        t.equal(spy.callCount, 2, "after 4th click");

        jqFixture.find("span").eq(0).click();
        t.equal(spy.callCount, 3, "after 5th click");

        testUtil.removeFixture();

        t.end();
    }
);