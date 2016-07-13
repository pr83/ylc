var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();
function triggerClick(jqElem, x, y) {
    var e = new jQuery.Event("mousedown");
    e.pageX = jqElem.offset().left + x;
    e.pageY = jqElem.offset().top + y;
    jqElem.trigger(e);
}

test(
    "passing event object",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/passingEventObject.html")
                ),
            yellowSpy = sinon.spy(),
            greenSpy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {

                createEventRecord: function(domElement, eventObject, color) {
                    var offset = $(domElement).offset(),
                        x = eventObject.pageX - offset.left,
                        y = eventObject.pageY - offset.top;
                    return {
                        x: x,
                        y: y
                    };
                },

                clickedYellow: function (model, context) {
                    yellowSpy(this.createEventRecord(context.domElement, context.eventObject));
                },

                clickedGreen: function (model, context) {
                    greenSpy(this.createEventRecord(context.domElement, context.eventObject));
                }
            }
        );

        triggerClick(jqFixture.children().first().find("#yellowArea"), 50, 60);
        t.equal(yellowSpy.args[0][0].x, 50, "click to yellow, x coordinate");
        t.equal(yellowSpy.args[0][0].y, 60, "click to yellow, y coordinate");

        triggerClick(jqFixture.children().first().find("#greenArea"), 111, 88);
        t.equal(greenSpy.args[0][0].x, 111, "click to green, x coordinate");
        t.equal(greenSpy.args[0][0].y, 88, "click to green, y coordinate");

        testUtil.removeFixture();

        t.end();
    }
);