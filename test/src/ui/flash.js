var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

var MARKER_ATTRIBUTE = "data-marker",
    MARKER_ATTRIBUTE_SET_BY_PLUGIN = "setByPlugin",
    MARKER_ATTRIBUTE_INITIAL_VALUE = "initialValue",
    TEXT_VALUE_INITIAL = "textValueInitial",
    TEXT_VALUE_MODIFIED_WITHOUT_FLASH = "textValueModifiedWithoutFlash",
    TEXT_VALUE_MODIFIED_WITH_FLASH = "textValueModifiedWithFlash";

function installPluginToElement(jqElement, t) {
    jqElement.children().each(
        function () {
            t.equal(
                $(this).attr(MARKER_ATTRIBUTE),
                MARKER_ATTRIBUTE_INITIAL_VALUE,
                "element correctly (re)initialized"
            );
            $(this).attr(MARKER_ATTRIBUTE, MARKER_ATTRIBUTE_SET_BY_PLUGIN);
        }
    );
}

test(
    "flash",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/flash.html")
                );

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.textValue = TEXT_VALUE_INITIAL;
                },

                installPlugin: function(model, context) {
                    installPluginToElement($(context.domElement), t);
                },
                
                "@Public": {
                    changeTextValueWithoutFlash: function(model) {
                        model.textValue = TEXT_VALUE_MODIFIED_WITHOUT_FLASH;
                    },

                    changeTextValueWithFlash: function(model, context) {
                        model.textValue = TEXT_VALUE_MODIFIED_WITH_FLASH;
                        context.flash("myFlashableElement");
                    }
                }
            }
        );

        t.equal(
            jqFixture.find("span").attr(MARKER_ATTRIBUTE),
            MARKER_ATTRIBUTE_SET_BY_PLUGIN,
            "plugin installed when DOM processed"
        );

        jqFixture.children().first().yellowCode("getPublicApi").changeTextValueWithoutFlash();

        t.equal(
            jqFixture.find("span").text(),
            TEXT_VALUE_INITIAL,
            "should not modify flashable element"
        );

        jqFixture.children().first().yellowCode("getPublicApi").changeTextValueWithFlash();

        setTimeout(
            function() {
                t.equal(
                    jqFixture.find("span").text(),
                    TEXT_VALUE_MODIFIED_WITH_FLASH,
                    "should modify flashable element with flash"
                );

                testUtil.removeFixture();
                t.end();
            },
            0
        );

    }
);