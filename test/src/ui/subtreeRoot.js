var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

function getCurrentColorBoxes(jqFixture) {
    return jqFixture.children().first().find(".currentColorBox:visible");
}

function getSelectColorBoxes(jqFixture) {
    return jqFixture.children().first().find(".selectColorBox:visible");
}

function getColor(jqFixture, index) {
    return getCurrentColorBoxes(jqFixture).eq(index).css("background-color");
}

test(
    "subtree root",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/subtreeRoot.html")
                ),
            jqDynamicallyGeneratedElements;

        (function($) {

            function createController() {
                return {
                    init: function(model) {
                        model.currentColor = "white";
                        model.edit = false;

                        model.colors = [
                            "red",
                            "green",
                            "blue",
                            "cyan",
                            "magenta",
                            "yellow",
                            "white",
                            "black",
                            "brown",
                            "gray",
                            "crimson",
                            "orange",
                            "violet",
                            "purple",
                            "pink"
                        ];
                    },

                    enableEdit: function(model, context) {
                        model.edit = true;
                    },

                    changeColor: function(model, context) {
                        model.currentColor = model.colors[context.loopStatuses.colorStatus.index];
                        model.edit = false;
                    },

                    getColor: function(model, context) {
                        return model.currentColor;
                    },

                    setColor: function(model, context, color) {
                        model.currentColor = color;
                    }
                };
            }

            function init(jqTopDiv) {
                var jqView;
                jqTopDiv.html(jqFixture.children().first().find("#colorWidgetHtml").html());
                jqView = $(jqTopDiv.children().get());
                jqView.yellowCode(createController());
            }

            $.fn.colorWidget = function(arg1, arg2) {
                var jqTopDiv = $(this),
                    jqView;

                if (arg1 === undefined) {
                    init(jqTopDiv);

                } else if (arg1 === "color" && arg2 === undefined) {
                    jqView = $(jqTopDiv.children().get());
                    return jqView.yellowCode("getAdapter").getColor();

                } else if (arg1 === "color" && arg2 !== undefined) {
                    jqView = $(jqTopDiv.children().get());
                    jqView.yellowCode("getAdapter").setColor(arg2);
                }
            };

        }(jQuery));

        var controller = {
            init: function (model) {
                model.colors = [
                    "red",
                    "black",
                    "blue",
                    "brown",
                    "yellow",
                    "crimson",
                    "green",
                    "orange",
                    "violet",
                    "white"
                ];
            },

            initColorWidgetPlugin: function (model, context) {
                $(context.domElement).colorWidget();
            },

            reverse: function(model, context) {
                var idxLeft = 0,
                    idxRight = model.colors.length - 1,
                    newLeft,
                    newRight;
                while (idxLeft < idxRight) {
                    newLeft = model.colors[idxRight];
                    newRight = model.colors[idxLeft];
                    model.colors[idxLeft] = newLeft;
                    model.colors[idxRight] = newRight;
                    idxLeft += 1;
                    idxRight -= 1;
                }
            },

            "@BeforeEvent": {
                beforeEventHandler: function () {
                    console.log("beforeEventHandler");
                }
            },

            afterEventHandler: {
                "@AfterEvent": function () {
                    console.log("afterEventHandler");
                }
            }

        };

        jqFixture.children().first().find("#colors").yellowCode(controller);

        var i;
        for (i = 0; i < 10; i += 1) {
            getCurrentColorBoxes(jqFixture).eq(i).trigger("click");
            getSelectColorBoxes(jqFixture).eq(i + 3).trigger("click");
        }

        jqFixture.children().first().find("button:visible").trigger("click");


        t.equal(
            getColor(jqFixture, 0),
            "rgb(238, 130, 238)",
            "color correct (box 1)"
        );

        t.equal(
            getColor(jqFixture, 1),
            "rgb(255, 165, 0)",
            "color correct (box 2)"
        );

        t.equal(
            getColor(jqFixture, 2),
            "rgb(220, 20, 60)",
            "color correct (box 3)"
        );

        t.equal(
            getColor(jqFixture, 3),
            "rgb(128, 128, 128)",
            "color correct (box 4)"
        );

        t.equal(
            getColor(jqFixture, 4),
            "rgb(165, 42, 42)",
            "color correct (box 5)"
        );

        t.equal(
            getColor(jqFixture, 5),
            "rgb(0, 0, 0)",
            "color correct (box 6)"
        );

        t.equal(
            getColor(jqFixture, 6),
            "rgb(255, 255, 255)",
            "color correct (box 7)"
        );

        t.equal(
            getColor(jqFixture, 7),
            "rgb(255, 255, 0)",
            "color correct (box 8)"
        );

        t.equal(
            getColor(jqFixture, 8),
            "rgb(255, 0, 255)",
            "color correct (box 9)"
        );

        t.equal(
            getColor(jqFixture, 9),
            "rgb(0, 255, 255)",
            "color correct (box 10)"
        );

        testUtil.removeFixture();

        console.log(jqFixture);

        t.end();
    }
);