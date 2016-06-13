var sinon = require("sinon"),
    lexer = require('../../src/lexer'),
    testUtil = require("./lib/testUtil"),

    test = testUtil.getTape();

test(
    "test",
    function (t) {

        var spy = sinon.spy();

        lexer.process(
            "A;  B;\n\t/*comment*/;\n\tC;\n\t'quotes'",
            [
                lexer.onConstantToken(
                    ";",
                    function(strToken) {
                        //console.log("semicolon: " + strToken);
                        spy("semicolon", strToken);
                    }
                ),
                lexer.onDelimitedToken(
                    "/*",
                    "*/",
                    function(strToken) {
                        //console.log("comment: " + strToken);
                        spy("comment", strToken);
                    }
                ),
                lexer.onDelimitedToken(
                    "'",
                    "'",
                    function(strToken) {
                        //console.log("quotes: " + strToken);
                        spy("quotes", strToken);
                    }
                ),
                lexer.onCharacterSequence(
                    [' ', '\n', '\r', '\t'],
                    function(strToken) {
                        //console.log("whitespace");
                        spy("whitespace");
                    }
                ),
                lexer.onDefaultToken(
                    function(strToken) {
                        //console.log("character: " + strToken);
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
                ]
            );

        t.end();

    }
);