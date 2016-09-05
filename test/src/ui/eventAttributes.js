var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "event attributes",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/eventAttributes.html")
                ),
            jqDynamicallyGeneratedElements,
            spy = sinon.spy(),
            controller = {
                init: function(model) {

                    model.list = [
                        {name: "red"},
                        {name: "green"},
                        {name: "blue"},
                        {name: "pink"},
                        {name: "white"},
                        {name: "black"},
                        {name: "yellow"}
                    ];
                },

                clicked: function(model, context) {
                    var index = context.loopStatuses.status.index;
                    spy(model.list[index].name);
                }
            };

        jqFixture.children().first().yellowCode(controller);

        jqDynamicallyGeneratedElements = jqFixture.find("li");

        jqDynamicallyGeneratedElements.eq(0).find("a").trigger("click");
        t.equal(spy.lastCall.args[0], "red", "1st link event attribute");

        jqDynamicallyGeneratedElements.eq(1).find("a").trigger("click");
        t.equal(spy.lastCall.args[0], "green", "2nd link event attribute");

        jqDynamicallyGeneratedElements.eq(5).find("a").trigger("click");
        t.equal(spy.lastCall.args[0], "black", "6th link event attribute");

        jqDynamicallyGeneratedElements.eq(6).find("a").trigger("click");
        t.equal(spy.lastCall.args[0], "yellow", "7th link event attribute");

        testUtil.removeFixture();

        t.end();
    }
);