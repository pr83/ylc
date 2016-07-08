var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "element property with colon",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/elementPropertyWithColon.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function (model, context) {
                    model.propertyValue = "old value";
                },

                setProperty: function(model, context) {
                    model.propertyValue = "new value";
                }
            }
        );

        t.equal(jqFixture.find("#spanWithProperty").attr("mynamespace:myproperty"), "old value", "before");
        jqFixture.children().first().yellowCode("getAdapter").setProperty();
        t.equal(jqFixture.find("#spanWithProperty").attr("mynamespace:myproperty"), "new value", "after");

        testUtil.removeFixture();

        t.end();
    }
);