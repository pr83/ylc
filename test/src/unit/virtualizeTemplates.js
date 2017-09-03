var test = require("tape"),
    testUtil = require("../common/testUtil"),
    virtualizeTemplates = require("../../../src/mixin/virtualizeTemplates");

testUtil.setUp();

test(
    "unit: virtualize templates",
    function (t) {

        var jqNode =
                $("<div data-ylcIf='someCondition && anotherCondition'></div>"),
            metadata = {};
        
        virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(jqNode, metadata);

        t.deepEqual(
            metadata.astYlcIf,
            {
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
            },
            "correctly parsed"
        );

        t.end();
    }

);

test(
    "unit: virtualize templates - ylcIf and ylcFlashId",
    function (t) {

        var jqNode =
                $("<div data-ylcIf='someCondition && anotherCondition' data-ylcFlashId='someFlashableElement'></div>"),
            metadata = {};

        virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(jqNode, metadata);

        t.deepEqual(
            metadata.astYlcIf,
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
                            "name": "someFlashableElement"
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
        
        t.ok(metadata.flashIdDefined, "'flashIdDefined' flag set");

        virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(jqNode, metadata);

        t.end();
    }

);

test(
    "unit: virtualize templates - only ylcFlashId",
    function (t) {

        var jqNode =
                $("<div data-ylcFlashId='someFlashableElement'></div>"),
            metadata = {};

        virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(jqNode, metadata);

        t.deepEqual(
            metadata.astYlcIf,
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
                        "name": "someFlashableElement"
                    }
                },
                "prefix": true
            },
            "correctly parsed"
        );

        t.ok(metadata.flashIdDefined, "'flashIdDefined' flag set");

        virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(jqNode, metadata);

        t.end();
    }

);