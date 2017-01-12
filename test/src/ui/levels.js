var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil"),
    metadata = require("../../../src/metadata");

testUtil.setUp();

test(
    "levels",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/levels.html")
                );

        jqFixture.children().first().yellowCode({});

        jqFixture.children().first().find("div").each(function() {
            t.equals(metadata.of($(this)).level + "", $(this).attr("data-level"), "level correctly detected");
        });

        testUtil.removeFixture();

        t.end();
    }
);