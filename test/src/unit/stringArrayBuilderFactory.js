var test = require("tape"),
    testUtil = require("../common/testUtil"),
    stringArrayBuilderFactory = require('../../../src/stringArrayBuilderFactory'),

    stringArrayBuilder = stringArrayBuilderFactory.newStringArrayBuilder();

testUtil.setUp();

test(
    "unit test: string array builder factory",
    function (t) {

        stringArrayBuilder.appendToCurrent("'x'");
        stringArrayBuilder.startNew();
        stringArrayBuilder.appendToCurrent("'y'");
        stringArrayBuilder.startNew();
        stringArrayBuilder.appendToCurrent("5");
        stringArrayBuilder.appendToCurrent("3");
        stringArrayBuilder.appendToCurrent("1");
        stringArrayBuilder.startNew();
        stringArrayBuilder.appendToCurrent("5");

        t.deepEqual(
            stringArrayBuilder.build(),
            [
                "'x'",
                "'y'",
                "531",
                "5"
            ],
            "correct callbacks called"
        );

        t.end();

    }
);