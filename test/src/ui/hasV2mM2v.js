var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil"),
    metadata = require("../../../src/metadata");

testUtil.setUp();

test(
    "has M2V, has V2M",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/hasM2vV2m.html")
                );

        jqFixture.children().first().yellowCode({});

        jqFixture.children().first().find("div").each(function() {
            t.equal((!!metadata.of($(this)).bHasM2v), (!!$(this).hasClass("m2v")), "correct M2V");
            t.equal((!!metadata.of($(this)).bHasV2m), (!!$(this).hasClass("v2m")), "correct V2M");
        });

        testUtil.removeFixture();

        t.end();
    }
);