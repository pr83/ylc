module.exports = (function () {

    var VIEW_ROOT_ATTR_NAME = "data-_ylcViewRoot",
        VIEW_ROOT_ATTR_VALUE = "data-_ylcViewRoot";

    return {
        markViewRoot: function(jqElement) {
            jqElement.attr(VIEW_ROOT_ATTR_NAME, VIEW_ROOT_ATTR_VALUE);
        },

        unmarkViewRoot: function(jqElement) {
            jqElement.removeAttr(VIEW_ROOT_ATTR_NAME);
        },

        isViewRoot: function(jqElement) {
            return (jqElement.attr(VIEW_ROOT_ATTR_NAME) === VIEW_ROOT_ATTR_VALUE);
        }
    };

}());