var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "compare null",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/compareNull.html")
            );

        jqFixture.children().first().yellowCode({
            init: function(model) {
                model.toCompare = null;
                model.parentObject = {
                    toCompare: null
                };
                model.array = [null];
            }
        });

        t.equal(
            jqFixture.find("#top").text(),
            "is null",
            "top variable should evaluate to null"
        );

        t.equal(
            jqFixture.find("#child").text(),
            "is null",
            "object variable should evaluate to null"
        );

        t.equal(
            jqFixture.find("#childAdHoc").text(),
            "is null",
            "object variable (ad hoc) should evaluate to null"
        );

        t.equal(
            jqFixture.find("#array").text(),
            "is null",
            "array element should evaluate to null"
        );

        t.equal(
            jqFixture.find("#arrayAdHoc").text(),
            "is null",
            "array element (ad hoc) should evaluate to null"
        );

        testUtil.removeFixture();

        t.end();
    }
);