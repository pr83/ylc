var test = require("tape"),
    testUtil = require("../common/testUtil"),
    moustache = require('../../../src/parser/moustache');

testUtil.setUp();

test(
    "unit test: moustache parser",
    function (t) {

        t.deepEqual(
            moustache.parse("abc{{def}}ghi{{jkl}}mno"),
            {
                "type": "BinaryExpression",
                "operator": "+",
                "left": {
                    "type": "BinaryExpression",
                    "operator": "+",
                    "left": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "BinaryExpression",
                            "operator": "+",
                            "left": {
                                "type": "Literal",
                                "value": "abc",
                                "raw": "'abc'"
                            },
                            "right": {
                                "type": "Identifier",
                                "name": "def"
                            }
                        },
                        "right": {
                            "type": "Literal",
                            "value": "ghi",
                            "raw": "'ghi'"
                        }
                    },
                    "right": {
                        "type": "Identifier",
                        "name": "jkl"
                    }
                },
                "right": {
                    "type": "Literal",
                    "value": "mno",
                    "raw": "'mno'"
                }
            },
            "starting with literal correctly parsed"
        );

        t.deepEqual(
            moustache.parse("{{abc}}def{{ghi}}jkl{{mno}}"),
            {
                "type": "BinaryExpression",
                "operator": "+",
                "left": {
                    "type": "BinaryExpression",
                    "operator": "+",
                    "left": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "BinaryExpression",
                            "operator": "+",
                            "left": {
                                "type": "Identifier",
                                "name": "abc"
                            },
                            "right": {
                                "type": "Literal",
                                "value": "def",
                                "raw": "'def'"
                            }
                        },
                        "right": {
                            "type": "Identifier",
                            "name": "ghi"
                        }
                    },
                    "right": {
                        "type": "Literal",
                        "value": "jkl",
                        "raw": "'jkl'"
                    }
                },
                "right": {
                    "type": "Identifier",
                    "name": "mno"
                }
            },
            "starting with identifier correctly parsed"
        );

        t.end();

    }

);