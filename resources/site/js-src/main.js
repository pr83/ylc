var Bottle = require("bottlejs");

function setUpGlobalObjects() {
    var bottle = new Bottle();
    bottle.value("domUtil", require("custom/domUtil"));
    window.ylcSite = bottle.container;
}

function installCodeExample() {
    $(document).ready(function() {
        $(".jqExample").codeExample();
    });
}

setUpGlobalObjects();
installCodeExample();