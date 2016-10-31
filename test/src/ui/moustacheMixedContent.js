var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "moustache",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/moustacheMixedContent.html")
                );

        t.throws(
            function() {
                jqFixture.yellowCode(
                    {
                        init: function(model) {
                            model.paragraph1 = "This is paragraph 1.";
                            model.paragraph2 = "This is paragraph 2.";
                        }
                    }
                );
            },
            testUtil.toRegExp(
                "Error: Elements containing {{...}} cannot be a part of mixed content. " +
                "Please wrap the chunk of text containing {{...}} into its own element " +
                "(e.g. <span>, <p>, <g>, etc.)"
            ),
            "correct exception thrown"
        );

        testUtil.removeFixture();

        t.end();
    }
);