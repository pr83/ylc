var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "remove tag - if",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/removeTagIf.html")
                ),
            jqDynamicallyGeneratedElements,
            publicApi =
                jqFixture.children().first().yellowCode(
                    {
                        init: function(model) {
                            model.condition1 = true;
                            model.condition2 = true;
                            model.item1 = "item1";
                            model.item2 = "item2";
                        },
                        
                        "@Public": {
                            changeItems: function(model, context, item1, item2) {
                                model.item1 = item1;
                                model.item2 = item2;
                            },
                            
                            switchConditions: function(model, context, condition1, condition2) {
                                model.condition1 = condition1;
                                model.condition2 = condition2;
                            }
                        }
                    },
                    "getPublicApi"
                );

        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "item1item1item2item2",
            "correctly generated elements after init"
        );

        publicApi.changeItems("i1", "i2");
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "i1i1i2i2",
            "elements correctly processed if conditions not changed"
        );

        publicApi.switchConditions(false, false);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "",
            "elements correctly removed"
        );

        publicApi.changeItems("i3", "i4");
        publicApi.switchConditions(true, false);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "i3i3",
            "elements correctly restored according to new condition, correctly processed"
        );

        publicApi.switchConditions(false, true);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "i4i4",
            "elements correctly restored according to new condition, correctly processed"
        );
        
        testUtil.removeFixture();
        
        t.end();
    }
);