var test = require("tape"),
    fs = require('fs'),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "DOM change",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/domChange.html")
                ),
            spy = sinon.spy();

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.listForSubtree = [1];
                    model.anotherList = [10];
                },

                subtreeChanged: function(model, context) {
                    spy();
                    return false;
                },

                valueChangeInSubtree: function(model, context) {
                    model.listForSubtree[0] = "2";
                    return false;
                },

                valueChangeOutsideSubtree: function(model, context) {
                    model.anotherList[0] = "20";
                    return false;
                },

                structuralChangeInSubtree: function(model, context) {
                    model.listForSubtree.push(3);
                    return false;
                },

                structuralChangeOutsideSubtree: function(model, context) {
                    model.anotherList.push(30);
                    return false;
                }
                
            }
        );

        t.ok(spy.calledOnce, "called upon initial DOM setup");
        
        spy = sinon.spy();
        jqFixture.find("#valueChangeInSubtree").trigger("click");
        t.ok(spy.calledOnce, "called if a value is changed in the subtree of element with data-ylcDomChanged");

        spy = sinon.spy();
        jqFixture.find("#valueChangeOutsideSubtree").trigger("click");
        t.ok(spy.notCalled, "not called if a value is changed in the only subtree of element without data-ylcDomChanged");

        spy = sinon.spy();
        jqFixture.find("#structuralChangeInSubtree").trigger("click");
        t.ok(spy.calledOnce, "called if a structure is changed in the subtree of element with data-ylcDomChanged");

        spy = sinon.spy();
        jqFixture.find("#structuralChangeOutsideSubtree").trigger("click");
        t.ok(spy.notCalled, "not called if a structure is changed only in the subtree of element without data-ylcDomChanged");

        testUtil.removeFixture();

        t.end();
    }
);