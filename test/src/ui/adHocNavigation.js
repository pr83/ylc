var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "ad hoc navigation",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/adHocNavigation.html")
                ),
            spy = sinon.spy(),
            dynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function (model) {
                    model.persons = [];
                    model.existingObject = {};
                    model.a = null;
                    model.b = "sousede";
                },

                printModel: function (model) {
                    spy(model);
                }
            }
        );

        jqFixture.children().first().find("button").trigger("click");

        dynamicallyGeneratedElements = jqFixture.children().first().find("span");

        t.equal(
            dynamicallyGeneratedElements.eq(0).text(),
            "",
            "person # address # delivery # street"
        );

        t.equal(
            dynamicallyGeneratedElements.eq(1).text(),
            "",
            "persons[10] # address # delivery # street"
        );

        t.equal(
            dynamicallyGeneratedElements.eq(2).text(),
            "",
            "existingObject.nonexistentObject # member"
        );

        t.equal(
            dynamicallyGeneratedElements.eq(3).text(),
            "",
            "a # b # c"
        );

        t.equal(
            dynamicallyGeneratedElements.eq(4).text(),
            "hej",
            "ddd ||| 'hej'"
        );

        t.equal(
            dynamicallyGeneratedElements.eq(6).text(),
            "sousede",
            "b ||| 'hola'"
        );

        t.equal(
            dynamicallyGeneratedElements.eq(7).text(),
            "",
            "arr@5#x"
        );

        t.equal(
            JSON.stringify(spy.args[0][0]),
            JSON.stringify({
                _ylcFlash:{},
                persons: [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    {
                        address: {
                            delivery: {
                                street: ""
                            }
                        }
                    }
                ],
                existingObject: {
                    nonexistentObject: {
                        member: ""
                    }
                },
                a: {
                    b: {
                        c: ""
                    }
                },
                b: "sousede",
                person: {
                    address: {
                        delivery: {
                            street: ""
                        }
                    }
                },
                ddd: "hej",
                arr: [
                    null,
                    null,
                    null,
                    null,
                    null,
                    {x: ""}
                ]
            }),
            "deep equal"
        );

        testUtil.removeFixture();

        t.end();
    }
);