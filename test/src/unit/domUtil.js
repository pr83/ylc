var test = require("tape"),
    testUtil = require("../common/testUtil"),
    domUtil = require("../../../src/domUtil");

testUtil.setUp();

test(
    "unit: DOM util",
    function (t) {

        var domClone =
            domUtil.clone(
                $("<div data-a='a'><span data-b='b'></span></div>").get(0),
                    function(domOriginal, domClone) {
                        if ($(domOriginal).attr("data-a")) {
                            $(domClone).attr("data-ax", $(domOriginal).attr("data-a") + "y");
                        }

                        if ($(domOriginal).attr("data-b")) {
                            $(domClone).attr("data-bx", $(domOriginal).attr("data-b") + "z");
                        }
                    }
                );

        t.equal(
            domClone.nodeName.toLowerCase(),
            "div",
            "correct root element"
        );

        t.equal(
            $(domClone).attr("data-a"),
            "a",
            "correct original attribute"
        );

        t.equal(
            $(domClone).attr("data-ax"),
            "ay",
            "correct postprocessor-set attribute"
        );

        t.equal(
            domClone.childNodes.length,
            1,
            "correct number of children"
        );

        t.equal(
            $(domClone.childNodes[0]).attr("data-b"),
            "b",
            "correct child original attribute"
        );

        t.equal(
            $(domClone.childNodes[0]).attr("data-bx"),
            "bz",
            "correct child postprocessor-set attribute"
        );

        t.end();
    }

);