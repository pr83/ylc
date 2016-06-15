var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "nested variables",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/nestedVariables.html")
                ),
            controller = {
                init: function(model) {
                    model.a = {
                        b: {
                            c: {
                                d: {
                                    e: "hey"
                                }
                            }
                        }
                    };
                },

                update: function(model, context) {
                    model.a.b.c.d.f = model.a.b.c.d.e;
                }

            };

        jqFixture.children().first().yellowCode(controller);

        t.equal(
            jqFixture.find("input:visible").val(),
            "hey",
            "test m2v"
        );

        jqFixture.find("input:visible").val("xxx").trigger("keyup");

        t.equal(
            jqFixture.find("span:visible").text(),
            "xxx",
            "test v2m & m2v"
        );

        testUtil.removeFixture();

        t.end();
    }
);