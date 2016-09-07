var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "DOM preprocess",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/domPreprocess.html")
                ),
            jqDynamicallyGeneratedElements;

        console.log("domPreprocess:");

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                },

                printDomElement: {
                    "@DomPreprocessorFactory": function() {
                        var counter = 0,
                            level = 0;
                        return {
                            nodeStart: function(jqNode, metadata) {
                                counter++;
                                level++;
                                console.log(counter + " (" + level + "): ", jqNode);
                                return false;
                            },

                            nodeEnd: function(jqNode, metadata) {
                                level--;
                                return false;
                            }
                        };
                    }
                }

            }
        );

        console.log("---\n");

        //t.equal(, "", "");

        testUtil.removeFixture();

        t.end();
    }
);