var test = require("tape"),
    testUtil = require("../common/testUtil"),
    virtualizeTemplates = require("../../../src/mixin/virtualizeTemplates");

testUtil.setUp();

test(
    "unit: process templates - loop with data-ylcRemoveTag",
    function (t) {

        var metadata = {};

        virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(
            $("<div data-ylcLoop='element: collection' data-ylcRemoveTag></div>"),
            metadata
        );

        t.equals(metadata.bRemoveTag, true, "removeTag recognized");

        t.end();
    }

);

test(
    "unit: process templates - loop without data-ylcRemoveTag",
    function (t) {

        var metadata = {};

        virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(
            $("<div data-ylcLoop='element: collection'></div>"),
            metadata
        );

        t.equals(!!(metadata.bRemoveTag), false, "removeTag absence recognized");

        t.end();
    }

);

test(
    "unit: process templates - data-ylcRemoveTag without loop/if",
    function (t) {

        var metadata = {};

        t.throws(
            function() {
                virtualizeTemplates["@DomPreprocessorFactory"]().nodeStart(
                    $("<div data-ylcRemoveTag></div>"),
                    metadata
                );
            },
            testUtil.toRegExp(
                "The data-ylcRemoveTag attribute can only be used in conjunction with data-ylcIf and " +
                "data-ylcLoop attributes."
            ),
            "throws exception"
        );

        t.end();
    }

);