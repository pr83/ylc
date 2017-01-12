var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "external event",
    function (t) {

        var jqFixture =
            testUtil.setUpFixture(
                fs.readFileSync(__dirname + "/readFieldsFromAdapter.html")
            ),
            jqView;

        jqView = jqFixture.children().first();

        jqView.yellowCode({
            init: function(model) {
                model.value = "";
            },
            
            getValue: function(model) {
                return model.value;
            },
            
            publicGetValue: {
                "@Public": function(model) {
                    return model.value;
                }
            }
            
        });

        jqView.find("input").val("testValue");
        var valueRead = jqView.yellowCode("getAdapter").getValue();
        t.equals(valueRead, "testValue", "value correctly read");

        jqView.find("input").val("testValue2");
        var valueReadViaPublicApi = jqView.yellowCode("getPublicApi").publicGetValue();
        t.equals(valueReadViaPublicApi, "testValue2", "value correctly read");
        
        testUtil.removeFixture();

        t.end();
    }
);