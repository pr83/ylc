var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "remove tag - input elements",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/removeTagInputElements.html")
                ),
            jqDynamicallyGeneratedElements,
            list =
                [
                    {first: "aaa", second: "xxx"},
                    {first: "bbb", second: "yyy"},
                    {first: "ccc", second: "zzz"},
                    {first: "ddd", second: "uuu"},
                    {first: "eee", second: "vvv"},
                    {first: "fff", second: "www"}
                ],
            publicApi =
                jqFixture.children().first().yellowCode(
                    {
                        init: function(model) {
                            model.list = list;
                        }
                    },
                    "getPublicApi"
                );

        jqDynamicallyGeneratedElements = jqFixture.find("input");

        jqDynamicallyGeneratedElements.eq(0).val("100").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(1).val("1000").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(2).val("200").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(3).val("2000").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(4).val("300").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(5).val("3000").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(6).val("400").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(7).val("4000").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(8).val("500").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(9).val("5000").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(10).val("600").trigger("keyup");
        jqDynamicallyGeneratedElements.eq(11).val("6000").trigger("keyup");

        t.deepEqual(
            list,
            [
                {first: "100", second: "1000"},
                {first: "200", second: "2000"},
                {first: "300", second: "3000"},
                {first: "400", second: "4000"},
                {first: "500", second: "5000"},
                {first: "600", second: "6000"}
            ],
            "correct values set for model"
        );

        testUtil.removeFixture();

        t.end();
    }
);