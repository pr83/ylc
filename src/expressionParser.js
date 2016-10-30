var jsep = require('jsep');

jsep.addBinaryOp("|||", 10);
jsep.addBinaryOp("#", 10);
jsep.addBinaryOp("@", 10);

module.exports = {

    toAst: function(strExpression) {
        return jsep(strExpression);
    }

};