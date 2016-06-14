var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "deleting elements",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/deletingElements.html")
                ),
            jqDynamicallyGeneratedElements,
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
                    model.list.splice(index, 1);
                }
            };

        jqFixture.children().first().yellowCode(controller);

        t.equal(
            jqFixture.find("li:visible").find("a").text(),
            "redgreenbluepinkwhiteblackyellow",
            "elements before test"
        );

        jqFixture.find("li:visible").eq(0).find("a").click();

        t.equal(
            jqFixture.find("li:visible").find("a").text(),
            "greenbluepinkwhiteblackyellow",
            "elements after deleting red"
        );

        jqFixture.find("li:visible").eq(2).find("a").click();

        t.equal(
            jqFixture.find("li:visible").find("a").text(),
            "greenbluewhiteblackyellow",
            "elements after deleting red, pink"
        );

        jqFixture.find("li:visible").eq(4).find("a").click();

        t.equal(
            jqFixture.find("li:visible").find("a").text(),
            "greenbluewhiteblack",
            "elements after deleting red, pink, yellow"
        );

        jqFixture.find("li:visible").eq(0).find("a").click();

        t.equal(
            jqFixture.find("li:visible").find("a").text(),
            "bluewhiteblack",
            "elements after deleting red, pink, yellow, green"
        );

        testUtil.removeFixture();

        t.end();
    }
);