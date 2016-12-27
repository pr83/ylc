var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "remove tag",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/removeTag.html")
                ),
            jqDynamicallyGeneratedElements,
            publicApi =
                jqFixture.children().first().yellowCode(
                    {
                        init: function(model) {
                            model.list =
                                ["aaa", "bbb", "ccc", "ddd", "eee", "fff"];
                        },
                        
                        "@Public": {
                            addElements: function(model, context, elements) {
                                $.each(
                                    elements,
                                    function(idx, element) {
                                        model.list.push(element);
                                    }
                                );
                            },

                            removeElementsFromBeginning: function(model, context, nElements) {
                                var index;
                                for (index = 0; index < nElements; index += 1) {
                                    model.list.shift();
                                }
                            },

                            removeElementsFromEnd: function(model, context, nElements) {
                                var index;
                                for (index = 0; index < nElements; index += 1) {
                                    model.list.pop();
                                }
                            }
                        }
                    },
                    "getPublicApi"
                );

        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "aaabbbcccdddeeefff",
            "correctly generated elements after init"
        );

        publicApi.addElements(["ggg"]);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "aaabbbcccdddeeefffggg",
            "correctly generated elements after adding one element"
        );

        publicApi.addElements(["hhh", "iii", "jjj"]);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "aaabbbcccdddeeefffggghhhiiijjj",
            "correctly generated elements after adding multiple elements"
        );

        publicApi.removeElementsFromBeginning(1);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "bbbcccdddeeefffggghhhiiijjj",
            "correctly generated elements after removing one element from beginning"
        );

        publicApi.removeElementsFromBeginning(2);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "dddeeefffggghhhiiijjj",
            "correctly generated elements after removing multiple elements from beginning"
        );

        publicApi.removeElementsFromEnd(1);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "dddeeefffggghhhiii",
            "correctly generated elements after removing one element from end"
        );

        publicApi.removeElementsFromEnd(2);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "dddeeefffggg",
            "correctly generated elements after removing multiple elements from end"
        );

        jqFixture.find("br").last().after($("<span>xxx</span><br/>"));
        publicApi.addElements(["kkk", "lll"]);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "dddeeefffgggkkklllxxx",
            "correctly generated elements added before a padding HTML"
        );

        publicApi.removeElementsFromEnd(1);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "dddeeefffgggkkkxxx",
            "correctly generated elements when one element removed from before a padding HTML"
        );

        publicApi.removeElementsFromEnd(2);
        jqDynamicallyGeneratedElements = jqFixture.find("span");
        t.equal(
            jqDynamicallyGeneratedElements.text(),
            "dddeeefffxxx",
            "correctly generated elements when multiple elements removed from before a padding HTML"
        );

        testUtil.removeFixture();
        
        t.end();
    }
);