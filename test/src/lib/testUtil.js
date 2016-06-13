var FIXTURE_ID = "__htmlTestingFixture",

    tape = require("tape"),
    tapeDom = require('tape-dom'),
    commonObjects = null;

function setUpCommonObjects() {
    if (!commonObjects) {
        tapeDom.installCSS();
        tapeDom.stream(tape);

        global.$ = global.jQuery = require("jquery");
        require("../../../src/yellowCode");

        commonObjects = {
            tape: tape
        };
    }
}

function removeFixture() {
    var jqFixture = $("#" + FIXTURE_ID);
    if (jqFixture.length > 0) {
        jqFixture.remove();
    }
}

module.exports = {

    getJQuery: function() {
        setUpCommonObjects();
        return commonObjects.jQuery;
    },

    getTape: function() {
        setUpCommonObjects();
        return commonObjects.tape;
    },

    setUpFixture: function(fileBuffer) {

        removeFixture();

        var jqFixture =
            $(
                "<div id=\"" + FIXTURE_ID + "\">" +
                fileBuffer.toString() +
                "</div>"
            );

        $("body").append(jqFixture);

        return jqFixture;

    },

    removeFixture: function() {
        removeFixture();
    }

};