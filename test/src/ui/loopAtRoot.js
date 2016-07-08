var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "loop at root",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/loopAtRoot.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.list =
                        ["aaa", "bbb", "ccc", "ddd", "eee", "fff"];
                }
            }
        );

        jqDynamicallyGeneratedElements = jqFixture.find("span:visible");


        t.equal(
            jqDynamicallyGeneratedElements.length,
            6,
            "correct number of elements"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(0).text(),
            "aaa",
            "1st element correct"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(1).text(),
            "bbb",
            "2nd element correct"
        );

        t.equal(
            jqDynamicallyGeneratedElements.eq(5).text(),
            "fff",
            "last element correct"
        );

        testUtil.removeFixture();

        t.end();
    }
);