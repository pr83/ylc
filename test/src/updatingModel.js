var sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("./lib/testUtil"),

    test = testUtil.getTape();

test(
    "updatingModel",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + '/../resources/' + "updatingModel.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.listOfElements = [];
                },

                addElement: function(model) {
                    var order = model.listOfElements.length + 1;
                    model.listOfElements.push({
                        text: "I am a dynamically generated string #" + order + "."
                    });
                }
            }
        );

        jqFixture.find("button").
            trigger("click").
            trigger("click").
            trigger("click");

        jqDynamicallyGeneratedElements = jqFixture.find("li:visible");
        t.equal(jqDynamicallyGeneratedElements.length, 3);
        t.equal(
            jqDynamicallyGeneratedElements.eq(0).text(),
            "I am a dynamically generated string #1."
        );
        t.equal(
            jqDynamicallyGeneratedElements.eq(1).text(),
            "I am a dynamically generated string #2."
        );
        t.equal(
            jqDynamicallyGeneratedElements.eq(2).text(),
            "I am a dynamically generated string #3."
        );

        testUtil.removeFixture();

        t.end();
    }
);