var test = require("tape"),
    testUtil = require("../common/testUtil"),
    combineIfAndFlashId = require("../../../src/parser/combineIfAndFlashId");

testUtil.setUp();

test(
    "unit: combine 'if' and 'flash ID' - ylcIf exists",
    function (t) {

        var astYlcIf = {
            type: "LogicalExpression",
            operator: "&&",
            left: {
                type: "Identifier",
                name: "someCondition"
            },
            right: {
                type: "Identifier",
                name: "anotherCondition"
            }
        };

        t.deepEqual(
            combineIfAndFlashId.combine("flashableElement", astYlcIf),
            {
                "type": "LogicalExpression",
                "operator": "&&",
                "left": {
                    "type": "UnaryExpression",
                    "operator": "!",
                    "argument": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "_ylcFlash"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "flashableElement"
                        }
                    },
                    "prefix": true
                },
                "right": {
                    "type": "LogicalExpression",
                    "operator": "&&",
                    "left": {
                        "type": "Identifier",
                        "name": "someCondition"
                    },
                    "right": {
                        "type": "Identifier",
                        "name": "anotherCondition"
                    }
                }
            },
            "correctly parsed"
        );

        t.end();
    }

);

test(
    "unit: combine 'if' and 'flash ID' - ylcIf does not exist",
    function (t) {

        var astYlcIf = undefined;

        t.deepEqual(
            combineIfAndFlashId.combine("flashableElement", astYlcIf),
            {
                "type": "UnaryExpression",
                "operator": "!",
                "argument": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "_ylcFlash"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "flashableElement"
                    }
                },
                "prefix": true
            },
            "correctly parsed"
        );

        t.end();
    }

);