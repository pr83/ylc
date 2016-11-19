var stringUtil = require("../stringUtil"),
    ylcEventsParser = require("../parser/ylcEvents");

module.exports = {

    "@DomPreprocessorFactory": function() {

        return {
            nodeStart: function(jqNode, metadata) {

                var strYlcEvents,
                    arrYlcEvents;

                metadata.listeners =
                    metadata.listeners || {
                        ylcLifecycle: {},
                        jsEvents: {}
                    };

                strYlcEvents = stringUtil.strGetData(jqNode, "ylcEvents");
                arrYlcEvents = ylcEventsParser.parseYlcEvents(strYlcEvents);

                $.each(
                    arrYlcEvents,
                    function(idx, ylcEvent) {

                        if (ylcEvent.strEventName === "ylcElementInitialized") {
                            metadata.listeners.ylcLifecycle.elementInitialized =
                                {
                                    strMethodName: ylcEvent.strMethodName,
                                    arrArgumentsAsts: ylcEvent.arrArgumentAsts
                                };

                        } else {
                            metadata.listeners.jsEvents[ylcEvent.strEventName] =
                                {
                                    strMethodName: ylcEvent.strMethodName,
                                    arrArgumentsAsts: ylcEvent.arrArgumentAsts
                                };
                        }

                    }
                );

                jqNode.removeAttr("data-ylcEvents");

                var ylcElementInit = stringUtil.strGetData(jqNode, "ylcElementInit");
                if (ylcElementInit) {
                    var objHandlerCall = ylcEventsParser.parseEventHandlerCall(ylcElementInit);
                    metadata.listeners.ylcLifecycle.elementInitialized =
                        {
                            strMethodName: objHandlerCall.strMethodName,
                            arrArgumentsAsts: objHandlerCall.arrArgumentAsts
                        };
                }
                jqNode.removeAttr("data-ylcElementInit");

                return false;
            },

            nodeEnd: function() {
                return false;
            }
        };
    }

};