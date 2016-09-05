var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil"),

    virtualNodes = require("../../../src/virtualNodes");

testUtil.setUp();


test(
    "unit: virtual nodes",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/virtualNodes.html")
                ),
            jqOriginalNode;

        virtualNodes.makeVirtual(jqFixture.find("#realNode"));

        t.equal(
            virtualNodes.isVirtual(jqFixture.find("[type='ylc/virtual']")),
            true,
            "virtual is detected as virtual"
        );

        jqOriginalNode = virtualNodes.getOriginal(jqFixture.find("[type='ylc/virtual']"));

        t.equal(
            virtualNodes.isVirtual(jqOriginalNode),
            false,
            "original is not detected as virtual"
        );

        t.equal(
            jqOriginalNode.prop("tagName").toLowerCase(),
            "div",
            "correct original node type"
        );

        t.equal(
            jqOriginalNode.find("p").text(),
            "something",
            "correct original node contents"
        );

        testUtil.removeFixture();

        t.end();
    }

);