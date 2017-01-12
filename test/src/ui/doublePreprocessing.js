var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "Double preprocessing",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/doublePreprocessing.html")
            );

        var controller = {
            
            init: function(model) {
                model.value = "";
            },
            
            setValue: function(model) {
                model.value = "something";
            }
        };

        jqFixture.children().first().yellowCode(controller);
        jqFixture.children().first().yellowCode(controller);

        jqFixture.children().first().yellowCode("getAdapter").setValue();

        t.equal(
            jqFixture.find("span").text(),
            "something",
            "double preprocessing preserves YLC bind"
        );

        testUtil.removeFixture();

        t.end();
    }
);