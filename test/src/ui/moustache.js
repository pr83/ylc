var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "moustache",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/moustache.html")
                ),
            spanWithMoustache,
            mixedContentsWithoutMoustache,
            i18n;

        jqFixture.yellowCode(
            {
                init: function(model) {
                    model.addressee = "Bob";
                    model.myName = "Bill";
                    model.color = "green";

                    model.numberOfRecords = 33;
                },

                translate: function(key, arg0, arg1) {
                    if (key === "dashboard.messages.numberOfRecordsParagraph") {
                        return "Hello " + arg0 + ", you have " + arg1 + " records.";
                    }
                }
            }
        );

        spanWithMoustache = $("#spanWithMoustache");
        t.equals(spanWithMoustache.text(), "Hello Bob, my name is Bill!", "text correct");
        t.equals(spanWithMoustache.attr("style"), "color: green", "attribute correct");

        mixedContentsWithoutMoustache = $("#mixedContentsWithoutMoustache");
        t.equals(mixedContentsWithoutMoustache.html(), "123<b>456</b>789", "mixed contents without moustache not affected");

        i18n = $("#i18n");
        t.equals(i18n.text(), "Hello Bob, you have 33 records.", "localized text correct");

        testUtil.removeFixture();

        t.end();
    }
);