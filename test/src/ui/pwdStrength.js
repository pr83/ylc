var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

function matches(jqElement, bPresent) {
    var cssClass = jqElement.attr("class");
    return (cssClass === "absent" && !bPresent) || (cssClass === "present" && bPresent);
}

function verifyClasses(jqFixture, bCorrectLength, bContainsDigit, bContainsCapital) {
    var jqLis = jqFixture.find("li");

    return matches(jqLis.eq(0), bCorrectLength) && matches(jqLis.eq(1), bContainsDigit) && matches(jqLis.eq(2), bContainsCapital);
}

test(
    "password strength",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/pwdStrength.html")
                ),
            jqDynamicallyGeneratedElements;

        jqFixture.children().first().yellowCode(
            {
                init: function(model) {
                    model.password = "";
                    model.isPwdEntered = false;

                    model.correctLength = false;
                    model.containsDigit = false;
                    model.containsCapital = false;
                },

                pwdEntered: function(model) {
                    model.isPwdEntered = true;

                    model.correctLength =
                        (7 <= model.password.length && model.password.length <= 25);
                    model.containsDigit =
                        /\d/.test(model.password);
                    model.containsCapital =
                        /[A-Z]/.test(model.password);
                }
            }
        );



        jqFixture.find("input").val("test");
        jqFixture.find("input").trigger("keyup");
        t.ok(verifyClasses(jqFixture, false, false, false), "no condition holds");

        jqFixture.find("input").val("xxxxxxx");
        jqFixture.find("input").trigger("keyup");
        t.ok(verifyClasses(jqFixture, true, false, false), "correct length");

        jqFixture.find("input").val("123");
        jqFixture.find("input").trigger("keyup");
        t.ok(verifyClasses(jqFixture, false, true, false), "contains digit");

        jqFixture.find("input").val("XXX");
        jqFixture.find("input").trigger("keyup");
        t.ok(verifyClasses(jqFixture, false, false, true), "contains capital");

        jqFixture.find("input").val("X1xxxxxxxxxxxxxxxxxxxxxxxx");
        jqFixture.find("input").trigger("keyup");
        t.ok(verifyClasses(jqFixture, false, true, true), "contains capital & digit");

        testUtil.removeFixture();

        t.end();
    }
);