var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "iteration index",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/iterationIndex.html")
                ),
            jqDynamicallyGeneratedElements;

        var controller = {
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
            }
        };

        jqFixture.children().first().yellowCode(controller);

        jqDynamicallyGeneratedElements = jqFixture.find("li");

        t.equal(jqDynamicallyGeneratedElements.length, 7, "correct number of elements");

        t.equal(
            $.trim(jqDynamicallyGeneratedElements.eq(0).find("span").eq(0).text()),
            "0",
            "0: correct index"
        );

        t.equal(
            $.trim(jqDynamicallyGeneratedElements.eq(1).find("span").eq(0).text()),
            "1",
            "1: correct index"
        );

        t.equal(
            $.trim(jqDynamicallyGeneratedElements.eq(6).find("span").eq(0).text()),
            "6",
            "6: correct index"
        );

        testUtil.removeFixture();

        t.end();
    }
);