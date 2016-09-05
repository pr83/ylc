var test = require("tape"),
    fs = require('fs'),
    testUtil = require("../common/testUtil");

testUtil.setUp();


test(
    "functions in model and controller",
    function (t) {

        var jqFixture =
                testUtil.setUpFixture(
                    fs.readFileSync(__dirname + "/functionsInModelAndController.html")
                ),
            jqDynamicallyGeneratedElements;

        var controller = {

            init: function (model, context) {
                model.data = [
                    [1, 4, 3, 1, 8],
                    [7, 2, 2, 3, 4],
                    [7, 5, 6, 9, 5],
                    [5, 4, 6, 7, 1]
                ];

                model.rowSum = function (rowIndex) {
                    var sum = 0,
                        row = this.data[rowIndex],
                        cellIndex;

                    for (cellIndex = 0; cellIndex < row.length; cellIndex += 1) {
                        sum += parseInt(row[cellIndex]);
                    }

                    return sum;
                };

                model.rowProduct = function (rowIndex) {
                    var sum = 1,
                        row = this.data[rowIndex],
                        cellIndex;

                    for (cellIndex = 0; cellIndex < row.length; cellIndex += 1) {
                        sum *= parseInt(row[cellIndex]);
                    }

                    return sum;
                };

            },

            dummy: function () {
            },

            decorateSum: function (sum) {
                return "sum = " + sum;
            },

            decorateProduct: function (product) {
                return "product = " + product;
            }

        };

        jqFixture.children().first().yellowCode(controller);

        t.equal(jqFixture.find(".sum").eq(0).val(), "sum = 17", "sum, row 1");
        t.equal(jqFixture.find(".sum").eq(1).val(), "sum = 18", "sum, row 2");
        t.equal(jqFixture.find(".sum").eq(2).val(), "sum = 32", "sum, row 3");
        t.equal(jqFixture.find(".sum").eq(3).val(), "sum = 23", "sum, row 4");

        t.equal(jqFixture.find(".product").eq(0).val(), "product = 96", "product, row 1");
        t.equal(jqFixture.find(".product").eq(1).val(), "product = 336", "product, row 2");
        t.equal(jqFixture.find(".product").eq(2).val(), "product = 9450", "product, row 3");
        t.equal(jqFixture.find(".product").eq(3).val(), "product = 840", "product, row 4");

        testUtil.removeFixture();

        t.end();
    }
);