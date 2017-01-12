var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "remove tag - if in loop",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/removeTagIfInLoop.html")
                ),
            jqDynamicallyGeneratedElements,
            publicApi =
                jqFixture.children().first().yellowCode(
                    {
                        init: function(model) {
                            model.condition = true;
                            model.loop = [1];
                        },
                        
                        "@Public": {
                            addElements: function(model, context) {
                                model.loop.push(2);
                            }
                        }
                    },
                    "getPublicApi"
                );
        
        console.log("--- adding element ---");

        publicApi.addElements();
        
        //
        // jqDynamicallyGeneratedElements = jqFixture.find("span");
        // t.equal(
        //     jqDynamicallyGeneratedElements.text(),
        //     "item1item1item2item2",
        //     "correctly generated elements after init"
        // );

        //testUtil.removeFixture();
        
        t.end();
    }
);