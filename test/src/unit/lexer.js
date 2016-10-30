var test = require("tape"),
    sinon = require("sinon"),
    testUtil = require("../common/testUtil"),
    lexer = require('../../../src/lexer');

testUtil.setUp();

test(
    "unit test: lexer",
    function (t) {

        var spy = sinon.spy();

        lexer.process(
            "A;  B;\n\t/*comment*/;\n\tC;\n\t'quotes'",
            [
                lexer.onConstantToken(
                    ";",
                    function(strToken) {
                        spy("semicolon", strToken);
                    }
                ),
                lexer.onDelimitedToken(
                    "/*",
                    "*/",
                    function(strToken) {
                        spy("comment", strToken);
                    }
                ),
                lexer.onDelimitedToken(
                    "'",
                    "'",
                    function(strToken) {
                        spy("quotes", strToken);
                    }
                ),
                lexer.onCharacterSequence(
                    [' ', '\n', '\r', '\t'],
                    function(strToken) {
                        spy("whitespace");
                    }
                ),
                lexer.onDefaultToken(
                    function(strToken) {
                        spy("character", strToken);
                    }
                )
            ]

        );

        t.deepEqual(
            spy.args,
            [
                    ["character", "A"],
                    ["semicolon", ";"],
                    ["whitespace"],
                    ["character", "B"],
                    ["semicolon", ";"],
                    ["whitespace"],
                    ["comment", "/*comment*/"],
                    ["semicolon", ";"],
                    ["whitespace"],
                    ["character", "C"],
                    ["semicolon", ";"],
                    ["whitespace"],
                    ["quotes", "'quotes'"]
            ],
            "correct callbacks called"
        );

        t.end();

    }

);

test(
    "unit test: lexer - delimited tokens inside free text",
    function (t) {

        var spy = sinon.spy();

        lexer.process(
            "abc{{def}}ghi{{jkl}}mno",
            [
                lexer.onDelimitedToken(
                    "{{",
                    "}}",
                    function(strToken) {
                        spy("delimited", strToken);
                    }
                )
            ],
            function(strToken) {
                spy("unmatched", strToken);
            }
        );

        t.deepEqual(
            spy.args,
            [
                ["unmatched", "abc"],
                ["delimited", "{{def}}"],
                ["unmatched", "ghi"],
                ["delimited", "{{jkl}}"],
                ["unmatched", "mno"]
            ],
            "correct callbacks called"
        );

        t.end();

    }

);