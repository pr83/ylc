var virtualNodes = require('./virtualNodes');

module.exports = (function () {

    var VIEW_ROOT_ATTR_NAME = "data-_ylcViewRoot",
        VIEW_ROOT_ATTR_VALUE = "data-_ylcViewRoot",
        TEMPLATE_IDS_CHECKED_ATTR_NAME = "data-_ylcTemplateIdsChecked",
        TEMPLATE_IDS_CHECKED_ATTR_VALUE = "data-_ylcTemplateIdsChecked";

    return {
        markViewRoot: function(jqElement) {
            virtualNodes.getOriginal(jqElement).attr(VIEW_ROOT_ATTR_NAME, VIEW_ROOT_ATTR_VALUE);
        },

        unmarkViewRoot: function(jqElement) {
            virtualNodes.getOriginal(jqElement).removeAttr(VIEW_ROOT_ATTR_NAME);
        },

        isViewRoot: function(jqElement) {
            return (virtualNodes.getOriginal(jqElement).attr(VIEW_ROOT_ATTR_NAME) === VIEW_ROOT_ATTR_VALUE);
        },

        markTemplateIdsChecked: function(jqElement) {
            virtualNodes.getOriginal(jqElement).attr(TEMPLATE_IDS_CHECKED_ATTR_NAME, TEMPLATE_IDS_CHECKED_ATTR_VALUE);
        },

        areTemplateIdsChecked: function(jqElement) {
            return (virtualNodes.getOriginal(jqElement).attr(TEMPLATE_IDS_CHECKED_ATTR_NAME) === TEMPLATE_IDS_CHECKED_ATTR_VALUE);
        }

    };

}());