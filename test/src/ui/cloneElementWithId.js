var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "clone element with id",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/cloneElementWithId.html")
                );

        t.throws(
            function() {
                jqFixture.children().first().yellowCode(
                    {
                        init: function(model) {
                            model.list = [1, 2, 3];
                        }
                    }
                );
            },
            testUtil.toRegExp("Error: Loop templates cannot contain elements with IDs, because looping would create multiple elements with the same ID."),
            "in loop should throw exception"
        );

        testUtil.removeFixture();

        t.end();
    }
);