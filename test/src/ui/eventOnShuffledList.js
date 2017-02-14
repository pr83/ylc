var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "event on shuffled list",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/eventOnShuffledList.html")
                ),
            jqDynamicallyGeneratedElements,
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.list =
                        [
                            {value: 1},
                            {value: 2}
                        ];
                },

                shuffle: function(model) {
                    model.list = [
                        model.list[1],
                        model.list[0]
                    ];
                },

                print: function(model, context, element) {
                    spy(element.value);
                }
            }
        );

        jqFixture.children().first().yellowCode("getAdapter").shuffle();

        jqFixture.find('button:contains("1")').click();
        jqFixture.find('button:contains("2")').click();

        t.equals(spy.args[0][0], 1, "first button correct arg passed");
        t.equals(spy.args[1][0], 2, "second button correct arg passed");

        testUtil.removeFixture();

        t.end();
    }
);