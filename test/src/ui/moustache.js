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
            mixedContentsWithoutMoustache;

        jqFixture.yellowCode(
            {
                init: function(model) {
                    model.addressee = "Bob";
                    model.myName = "Bill";
                    model.color = "green";
                }
            }
        );

        spanWithMoustache = $("#spanWithMoustache");
        mixedContentsWithoutMoustache = $("#mixedContentsWithoutMoustache");

        t.equals(spanWithMoustache.text(), "Hello Bob, my name is Bill!", "text correct");
        t.equals(spanWithMoustache.attr("style"), "color: green", "attribute correct");
        t.equals(mixedContentsWithoutMoustache.html(), "123<b>456</b>789", "mixed contents without moustache not affected");

        testUtil.removeFixture();

        t.end();
    }
);