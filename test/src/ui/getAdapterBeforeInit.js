var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "get adapter before init",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/getAdapterBeforeInit.html")
                ),
            jqDynamicallyGeneratedElements;

        setTimeout(
            function () {
                jqFixture.children().first().yellowCode({});
            },
            0
        );

        t.throws(
            function() {
                jqFixture.children().first().yellowCode("getAdapter");
            },
            testUtil.toRegExp("Error: Cannot get an adapter. This element is not a YLC view root. Make sure Yellow Code has been properly initialized with this element as a view root."),
            "correctly reported"
        );

        testUtil.removeFixture();

        t.end();
    }
);