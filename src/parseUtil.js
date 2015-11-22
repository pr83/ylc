var stringArrayBuilderFactory = require('./stringArrayBuilderFactory'),
    lexer = require('./lexer');

module.exports = (function () {

    return {

        split: function(string, strSeparator) {

            var stringArrayBuilder = stringArrayBuilderFactory.newStringArrayBuilder();

            lexer.process(
                string,
                [
                    lexer.onConstantToken(
                        strSeparator,
                        function(strToken) {
                            stringArrayBuilder.startNew();
                        }
                    ),

                    lexer.onDelimitedToken("/*", "*/"),

                    lexer.onDelimitedToken(
                        "'",
                        "'",
                        function(strToken) {
                            stringArrayBuilder.appendToCurrent(strToken)
                        }
                    ),

                    lexer.onDelimitedToken(
                        "\"",
                        "\"",
                        function(strToken) {
                            stringArrayBuilder.appendToCurrent(strToken)
                        }
                    ),

                    lexer.onCharacterSequence(
                        [' ', '\n', '\r', '\t'],
                        function(strToken) {
                            stringArrayBuilder.appendToCurrent(" ")
                        }
                    ),

                    lexer.onDefaultToken(
                        function(strToken) {
                            stringArrayBuilder.appendToCurrent(strToken)
                        }
                    )
                ]
            );

            return stringArrayBuilder.build();

        }

    };

}());