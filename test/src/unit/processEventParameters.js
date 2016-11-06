var test = require("tape"),
    testUtil = require("../common/testUtil"),
    processEventParameters = require("../../../src/mixin/processEventParameters");

testUtil.setUp();

test(
    "unit: process event parameters",
    function (t) {

        var jqNode =
                $("<div data-ylcEvents='click: clickHandler(1, 2); ylcElementInitialized: initHandler(3, 4);'></div>"),
            metadata = {};

        processEventParameters["@DomPreprocessorFactory"]().nodeStart(jqNode, metadata);

        t.deepEqual(
            metadata.listeners,
            {
                "ylcLifecycle": {
                    "elementInitialized": {
                        "strMethodName": "initHandler",
                            "arrArgumentsAsts": [
                                {
                                    "type": "Literal",
                                    "value": 3,
                                    "raw": "3"
                                },
                                {
                                    "type": "Literal",
                                    "value": 4,
                                    "raw": "4"
                                }
                            ]
                        }
                    },
                    "jsEvents": {
                        "click": {
                            "strMethodName": "clickHandler",
                            "arrArgumentsAsts": [
                                {
                                    "type": "Literal",
                                    "value": 1,
                                    "raw": "1"
                                },
                                {
                                    "type": "Literal",
                                    "value": 2,
                                    "raw": "2"
                                }
                            ]
                        }
                    }
            },
            "correctly parsed"
        );

        t.end();
    }

);

test(
    "unit: process data-ylcElementInit",
    function (t) {

        var jqNode =
                $("<div data-ylcElementInit='initHandler(5, 6)'></div>"),
            metadata = {};

        processEventParameters["@DomPreprocessorFactory"]().nodeStart(jqNode, metadata);

        t.deepEqual(
            metadata.listeners,
            {
                "ylcLifecycle": {
                    "elementInitialized": {
                        "strMethodName": "initHandler",
                        "arrArgumentsAsts": [
                            {
                                "type": "Literal",
                                "value": 5,
                                "raw": "5"
                            },
                            {
                                "type": "Literal",
                                "value": 6,
                                "raw": "6"
                            }
                        ]
                    }
                },
                "jsEvents": {}
            },
            "correctly parsed"
        );

        t.end();
    }

);