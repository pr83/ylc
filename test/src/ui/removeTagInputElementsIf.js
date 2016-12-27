var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "remove tag - input elements - if",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/removeTagInputElementsIf.html")
                ),
            jqDynamicallyGeneratedElements,
            items = ["item1", "item2", "item3", "item4"],
            publicApi =
                jqFixture.children().first().yellowCode(
                    {
                        init: function(model) {
                            model.condition1 = true;
                            model.condition2 = true;
                            model.items = items;
                        }
                    },
                    "getPublicApi"
                );

        jqDynamicallyGeneratedElements = jqFixture.find("input");
        
        jqDynamicallyGeneratedElements.eq(0).val("100").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(1).val("200").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(2).val("300").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(3).val("400").trigger("keyup");
        
        t.equals(items[0], "100", "correct item 1");
        t.equals(items[1], "200", "correct item 2");
        t.equals(items[2], "300", "correct item 3");
        t.equals(items[3], "400", "correct item 4");
        
        /*
        t.deepEqual(
            list,
            [
                {first: "100", second: "1000"},
                {first: "200", second: "2000"},
                {first: "300", second: "3000"},
                {first: "400", second: "4000"},
                {first: "500", second: "5000"},
                {first: "600", second: "6000"}
            ],
            "correct values set for model"
        );
        */

        //testUtil.removeFixture();

        t.end();
    }
);