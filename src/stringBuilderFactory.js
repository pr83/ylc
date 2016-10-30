module.exports = {

    newStringBuilder: function() {

        var sb = [];

        return {

            append: function(strToAppend) {
                sb.push(strToAppend);
            },

            isNotEmpty: function() {
                return sb.length > 0;
            },

            build: function() {
                return sb.join("");
            }

        };

    }

};