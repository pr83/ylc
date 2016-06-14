var test = require("tape"),
    sinon = require("sinon"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();

test(
    "tree",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/tree.html")
                ),
            level1Elements,
            level1Title,
            level2Elements,
            level2Title,
            level3Elements,
            level2Title;

        var controller = {
            init: function(model) {

                model.level1nodes = [];

                model.level1nodes.push({
                    name: "AAAAA",
                    level2nodes: [
                        {name: "11111", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "22222", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "33333", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "44444", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "55555", level3nodes: [{name: "xxx"}, {name: "yyy"}]}
                    ]
                });

                model.level1nodes.push({
                    name: "BBBBB",
                    level2nodes: [
                        {name: "11111", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "22222", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "33333", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "44444", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "55555", level3nodes: [{name: "xxx"}, {name: "yyy"}]}
                    ]
                });

                model.level1nodes.push({
                    name: "CCCCC",
                    level2nodes: [
                        {name: "11111", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "22222", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "33333", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "44444", level3nodes: [{name: "xxx"}, {name: "yyy"}]},
                        {name: "55555", level3nodes: [{name: "xxx"}, {name: "yyy"}]}
                    ]
                });
            }
        };

        jqFixture.children().first().yellowCode(controller);

        // level 1
        level1Elements = jqFixture.find(".level1:visible");
        t.equal(3, level1Elements.length, "number of level 1 elements");
        level1Title = level1Elements.eq(0).find("span:visible");
        t.equal($.trim(level1Title.eq(0).text()), "0)", "level 1 title - first span");
        t.equal($.trim(level1Title.eq(1).text()), "AAAAA", "level 1 title - second span");

        // level 2
        level2Elements = level1Elements.eq(1).find(".level2:visible");
        t.equal(5, level2Elements.length, "number of level 2 elements");
        level2Title = level2Elements.eq(2).find("span:visible");
        t.equal($.trim(level2Title.eq(0).text()), "2)", "level 2 title - first span");
        t.equal($.trim(level2Title.eq(1).text()), "33333", "level 2 title - second span");

        // level 3
        level3Elements = level2Elements.eq(3).find(".level3:visible");
        t.equal(2, level3Elements.length, "number of level 3 elements");
        level3Title = level3Elements.eq(1).find("span:visible");
        t.equal($.trim(level3Title.eq(0).text()), "1)", "level 3 title - first span");
        t.equal($.trim(level3Title.eq(1).text()), "yyy", "level 3 title - second span");

        testUtil.removeFixture();

        t.end();
    }
);