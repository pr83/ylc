var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

function getDefinitionListValue(jqList, title) {
    var jqTitleElement =
        jqList.find("dt").filter(function(){
            return $(this).text() === title;
        });
    return jqTitleElement.next().text();
}

function testValue(jqList, title, value, t) {
    t.equal(getDefinitionListValue(jqList, title), value, title);
}

test(
    "expression evaluation",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/expressionEvaluation.html")
                ),
            controller = {
                init: function(model) {
                    model.str = "This is a string.";
                    model.num = 333;

                    model.obj = {
                        str: "String inside object",
                        num: 333333
                    };

                    model.arr = ["A", "B", "C", "D"];
                    model.index2 = 2;

                    model.name = "Pepa";
                    model.surname = "Zdepa";

                    model.x1 = 2000;
                    model.x2 = 0;
                    model.x3 = 10;
                    model.x4 = 4;

                    model.x = 15;
                    model.y = 17;
                },

                myFunction: function(arg1, arg2, arg3, arg4) {
                    return  "arg1: " + arg1 + ", " +
                        "arg2: " + arg2 + ", " +
                        "arg3: " + arg3 + ", " +
                        "arg4: " + arg4;
                }
            };

        jqFixture.children().first().yellowCode(controller);

        testValue(jqFixture, "str", "This is a string.", t);
        testValue(jqFixture, "num", "333", t);
        testValue(jqFixture, "obj.str", "String inside object", t);
        testValue(jqFixture, "obj.num", "333333", t);
        testValue(jqFixture, "arr[0]", "A", t);
        testValue(jqFixture, "arr[index2]", "C", t);
        testValue(jqFixture, "name + ' ' + surname", "Pepa Zdepa", t);
        testValue(jqFixture, "x1 + x2 + x3 + x4", "2014", t);
        testValue(jqFixture, "1000 - 1", "999", t);
        testValue(
            jqFixture,
            "(2 * 1000 + 0 * 100 + 1 * 10 + 4 * 1) - (1 * 1000 + 9 * 100 + 8 * 10 + 3 * 1)",
            "31",
            t
        );
        testValue(jqFixture, "5 > 2", "true", t);
        testValue(jqFixture, "x === y", "false", t);
        testValue(jqFixture, "x !== y", "true", t);
        testValue(jqFixture, "true && false", "false", t);
        testValue(jqFixture, "true || false", "true", t);
        testValue(jqFixture, "true ? 'YES' : 'NO'", "YES", t);
        testValue(jqFixture, "false ? 'YES' : 'NO'", "NO", t);
        testValue(jqFixture, "+10", "10", t);
        testValue(jqFixture, "-10", "-10", t);
        testValue(jqFixture, "!(5 > 2)", "false", t);
        testValue(jqFixture, "myFunction(1, 2, x, y)", "arg1: 1, arg2: 2, arg3: 15, arg4: 17", t);

        testUtil.removeFixture();

        t.end();
    }
);