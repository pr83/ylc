var stringUtil = require('./stringUtil');

module.exports = (function () {

    return {

        newStringArrayBuilder: function() {

            var sbCurrent = [],
                arrResult = [];

            return {

                appendToCurrent: function(strToAppend) {
                    sbCurrent.push(strToAppend);
                },

                startNew: function() {
                    arrResult.push(sbCurrent.join(""));
                    sbCurrent = [];
                },

                build: function() {
                    arrResult.push(sbCurrent.join(""));
                    return arrResult;
                }

            };

        }

    };

}());