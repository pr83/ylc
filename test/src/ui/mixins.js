var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "mixins",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/mixins.html")
                ),
            jqDynamicallyGeneratedElements;

        $.yellowCode.standardMixins = [
            {
                function3: function(model) {
                    model.value3 = "v3";
                }
            }
        ];

        jqFixture.children().first().yellowCode(
            [
                {
                    init: function(model) {
                        model.value1 = "";
                        model.value2 = "";
                        model.value3 = "";
                    },

                    function1: function(model) {
                        model.value1 = "v1";
                    }
                },
                {
                    function2: function(model) {
                        model.value2 = "v2";
                    }
                }
            ]
        );

        $.yellowCode.standardMixins = [];

        jqFixture.find("button").click();

        jqDynamicallyGeneratedElements = jqFixture.find("span");

        t.equal(jqDynamicallyGeneratedElements.eq(0).text(), "v1", "mixin 1 works");
        t.equal(jqDynamicallyGeneratedElements.eq(1).text(), "v2", "mixin 2 works");
        t.equal(jqDynamicallyGeneratedElements.eq(2).text(), "v3", "standard mixin works");

        testUtil.removeFixture();

        t.end();
    }
);