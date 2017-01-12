var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "multiple external events",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/multipleExternalEvents.html")
                ),
            submodel = {};

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.submodel = submodel;
                },

                setVariable1: function(model, context, value) {
                    model.submodel.variable1 = value;
                },

                setVariable2: function(model, context, value) {
                    model.submodel.variable2 = value;
                },

                setVariable3: function(model, context, value) {
                    model.submodel.variable3 = value;
                }
            }
        );

        jqFixture.children().first().yellowCode("getAdapter").setVariable1("This is value 1.");
        t.equal(submodel.variable1, "This is value 1.", "after 1st event, variable 1");
        t.equal(submodel.variable2, "", "after 1st event, variable 2");
        t.equal(submodel.variable3, "", "after 1st event, variable 3");

        jqFixture.children().first().yellowCode("getAdapter").setVariable3("This is value 3.");
        t.equal(submodel.variable1, "This is value 1.", "after 2nd event, variable 1");
        t.equal(submodel.variable2, "", "after 2nd event, variable 2");
        t.equal(submodel.variable3, "This is value 3.", "after 2nd event, variable 3");

        jqFixture.children().first().yellowCode("getAdapter").setVariable2("This is value 2.");
        t.equal(submodel.variable1, "This is value 1.", "after 3rd event, variable 1");
        t.equal(submodel.variable2, "This is value 2.", "after 3rd event, variable 2");
        t.equal(submodel.variable3, "This is value 3.", "after 3rd event, variable 3");

        testUtil.removeFixture();

        t.end();
    }
);