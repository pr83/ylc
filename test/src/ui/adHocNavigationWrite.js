var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "ad hoc navigation (write)",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/adHocNavigationWrite.html")
                ),
            spy = sinon.spy(),
            dynamicallyGeneratedInputs,
            dynamicallyGeneratedSpans;

        jqFixture.children().first().yellowCode(
            {
                init: function (model) {
                    model.step = "WRITE";
                    model.persons = [];
                    model.existingObject = {};
                    model.a = null;
                },

                read: function (model) {
                    model.step = "READ";
                }
            }
        );

        dynamicallyGeneratedInputs = jqFixture.children().first().find("input");


        t.equal(
            dynamicallyGeneratedInputs.eq(0).val(),
            "",
            "person # address # delivery # street"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(1).val(),
            "",
            "persons[10] # address # delivery # street"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(2).val(),
            "",
            "existingObject.nonexistentObject # member"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(3).val(),
            "",
            "a # b # c"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(4).val(),
            "empty",
            "(l1 # l2 # l3) ||| 'empty'"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(5).val(),
            "-1",
            "xx ||| -1"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(6).val(),
            "",
            "undefinedArray@3"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(7).val(),
            "",
            "undefinedArray@3"
        );

        t.equal(
            dynamicallyGeneratedInputs.eq(8).val(),
            "",
            "(arr1[5]) ||| 'x'"
        );

        var i;
        for (i = 0; i <= 8; i += 1) {
            dynamicallyGeneratedInputs.eq(i).val("value" + i);
        }

        jqFixture.children().first().find("button").trigger("click");

        dynamicallyGeneratedSpans = jqFixture.children().first().find("span");

        for (i = 0; i <= 8; i += 1) {
            t.equal(
                dynamicallyGeneratedSpans.eq(i).text(),
                "value" + i,
                "input " + i
            );
        }

        testUtil.removeFixture();

        t.end();
    }
);