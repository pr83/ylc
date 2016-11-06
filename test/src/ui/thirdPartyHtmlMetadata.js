var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "metadata in 3rd party HTML elements",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/thirdPartyHtmlMetadata.html")
                );

        var controller = {
            addExtraHtml: function(model, context) {
                $(context.domElement).html("<span></span>");
            },

            "@Public": {
                dummy: function(model, context) {
                }
            }

        };

        jqFixture.children().first().yellowCode(controller);

        jqFixture.children().first().yellowCode("getPublicApi").dummy();

        testUtil.removeFixture();

        t.end();
    }
);