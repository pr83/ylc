var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "errors in expressions",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/errorsInExpressions.html")
                ),
            controller =
                {
                    init: function (model) {
                        model.n = null;
                    },

                    dummy: function(model) {
                    }
                };

        jqFixture.find("#addition").yellowCode(controller);
        jqFixture.find("#multiplication").yellowCode(controller);

         t.throws(
             function() {
                jqFixture.find("#navigation").yellowCode(controller);
             },
             testUtil.toRegExp("Error: Left hand side of the '.' operator must not be null/undefined."),
             "navigation"
         );

        t.throws(
            function() {
                jqFixture.find("#nullNavigation").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Left hand side of the '.' operator must not be null/undefined."),
            "null navigation"
        );

        jqFixture.find("#adHocNavigation").yellowCode(controller);
        jqFixture.find("#adHocNullNavigation").yellowCode(controller);

        t.throws(
            function() {
                jqFixture.find("#arrayAccess").yellowCode(controller);
            },
            testUtil.toRegExp("Error: Left hand side of the '[]' operator must not be null/undefined."),
            "array access"
        );

        jqFixture.find("#comparison").yellowCode(controller);
        jqFixture.find("#comparisonLess").yellowCode(controller);
        jqFixture.find("#comparisonDefaults").yellowCode(controller);
        jqFixture.find("#comparisonDefaultsLess").yellowCode(controller);
        jqFixture.find("#comparisonDefaultsGreater").yellowCode(controller);
        jqFixture.find("#comparisonDefaultsGreater").yellowCode(controller);
        jqFixture.find("#not").yellowCode(controller);
        jqFixture.find("#nonObjectMember").yellowCode(controller);
        jqFixture.find("#nonObjectMemberWrite").yellowCode(controller);
        jqFixture.find("#nonArrayElement").yellowCode(controller);
        jqFixture.find("#nonArrayElementWrite").yellowCode(controller);

        testUtil.removeFixture();

        t.end();
    }
);