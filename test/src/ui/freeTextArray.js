var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

function setInputValue(jqInput, value) {
    jqInput.val(value);
    jqInput.trigger("keyup");
}

test(
    "free text array",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/freeTextArray.html")
                ),
            controller = {
                init: function(model) {
                    model.strings = [
                        "one",
                        "two",
                        "three",
                        "four",
                        "five"
                    ];
                }
            };

        jqFixture.children().first().yellowCode(controller);

        t.equal(
            jqFixture.find("li:visible").text(),
            "onetwothreefourfive",
            "correct elements"
        );

        testUtil.removeFixture();

        t.end();
    }
);