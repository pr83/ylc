(function($) {

    function createController() {
        return {
            init: function(model) {
                model.currentColor = "white";
                model.edit = false;

                model.colors = [
                    "red",
                    "green",
                    "blue",
                    "cyan",
                    "magenta",
                    "yellow",
                    "white",
                    "black",
                    "brown",
                    "gray",
                    "crimson",
                    "orange",
                    "violet",
                    "purple",
                    "pink"
                ];
            },

            enableEdit: function(model, context) {
                model.edit = true;
            },

            changeColor: function(model, context) {
                model.currentColor = model.colors[context.loopStatuses.colorStatus.index];
                model.edit = false;
            },

            getColor: function(model, context) {
                return model.currentColor;
            },

            setColor: function(model, context, color) {
                model.currentColor = color;
            }
        };
    }

    function init(jqTopDiv) {
        var jqView;
        jqTopDiv.html(require('./colorWidget.html'));
        jqView = $(jqTopDiv.children().get());
        jqView.yellowCode(createController());
    }

    $.fn.colorWidget = function(arg1, arg2) {
        var jqTopDiv = $(this),
            jqView;

        if (arg1 === undefined) {
            init(jqTopDiv);

        } else if (arg1 === "color" && arg2 === undefined) {
            jqView = $(jqTopDiv.children().get());
            return jqView.yellowCode("getAdapter").getColor();

        } else if (arg1 === "color" && arg2 !== undefined) {
            jqView = $(jqTopDiv.children().get());
            jqView.yellowCode("getAdapter").setColor(arg2);
        }
    };

}(jQuery));