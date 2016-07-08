var FIXTURE_ID = "__htmlTestingFixture",

    tape = require("tape"),
    tapeDom = require('tape-dom'),
    setUpDone = false;

function setUp() {
    if (!setUpDone) {
        if (window.setUpTapeDom) {
            tapeDom.installCSS();
            tapeDom.stream(tape);
        }

        global.$ = global.jQuery = require("jquery");
        require("../../../src/yellowCode");

        $("head").append($("<style>.ylcInvisibleTemplate {display: none;}</style>"));

        setUpDone = true;
    }
}

function removeFixture() {
    var jqFixture = $("#" + FIXTURE_ID);
    if (jqFixture.length > 0) {
        jqFixture.remove();
    }
}

module.exports = {

    setUp: function() {
        setUp();
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
    },

    toRegExp: function(str) {
        return new RegExp(str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    }

};