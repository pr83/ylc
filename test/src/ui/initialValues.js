var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "initial values",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/initialValues.html")
                ),
            spy = sinon.spy();

        jqFixture.children().first().find("input:visible").eq(0).val("testval1");
        jqFixture.children().first().find("input:visible").eq(1).val("testval2");
        jqFixture.children().first().find("input:visible").eq(2).val("testval3");

        jqFixture.children().first().yellowCode({

            init: function (model, context) {
                model.value1 = context.PREFIELD;
                model.value2 = context.PREFIELD;
                model.value3 = context.PREFIELD;
            },

            printValues: function (model) {
                spy(model.value1, model.value2, model.value3);
            }

        });

        jqFixture.children().first().find("button:visible").trigger("click");

        t.equal(
            spy.args[0][0],
            "testval1",
            "1st input correct model value"
        );

        t.equal(
            spy.args[0][1],
            "testval2",
            "2nd input correct model value"
        );

        t.equal(
            spy.args[0][2],
            "testval3",
            "3rd input correct model value"
        );

        testUtil.removeFixture();

        t.end();
    }
);