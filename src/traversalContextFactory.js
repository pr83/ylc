var errorUtil = require('./errorUtil');

module.exports = {};

module.exports.newTraversalContext = function() {

    var my = {
            loopVariables: {},
            loopStatuses: {}
        },
        that = {};

    that.enterIteration = function (
            strLoopVariableName,
            arrCollection,
            strStatusVariableName,
            intIndex
    ) {

        var bLoopVariableUsed,
            bStatusVariableUsed;

        // setting loop variable

        bLoopVariableUsed =
            my.loopVariables[strLoopVariableName] !== undefined ||
            my.loopStatuses[strLoopVariableName] !== undefined;

        if (bLoopVariableUsed) {
            throw errorUtil.createError(
                "Loop variable '" + strLoopVariableName + "' is already used."
            );
        }

        my.loopVariables[strLoopVariableName] = {
            underlyingCollection: arrCollection,
            index: intIndex
        };


        // setting status variable

        if (strStatusVariableName !== undefined) {

            bStatusVariableUsed =
                my.loopStatuses[strStatusVariableName] !== undefined ||
                my.loopVariables[strStatusVariableName] !== undefined;

            if (bStatusVariableUsed) {
                throw errorUtil.createError(
                    "Loop status variable '" + strStatusVariableName + "' is already used."
                );
            }

            my.loopStatuses[strStatusVariableName] = {index: intIndex};
        }
    };

    that.exitIteration = function (
            strLoopVariableName,
            strStatusVariableName
    ) {
        my.loopVariables[strLoopVariableName] = undefined;
        if (strStatusVariableName !== undefined) {
            my.loopStatuses[strStatusVariableName] = undefined;
        }
    };

    that.getLoopStatusesSnapshot = function () {
        return $.extend(true, {}, my.loopStatuses);
    };

};