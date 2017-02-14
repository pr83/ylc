var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "preserveType",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/preserveType.html")
                );

        var controller = {
            init: function(model) {
                model.list = [1, 2];
            }
        };

        jqFixture.children().first().yellowCode(controller);

        jqFixture.find("button").click();
        t.equals(jqFixture.find("#containsOriginal").text(), "true", "type of list element preserved");

        testUtil.removeFixture();

        t.end();
    }
);