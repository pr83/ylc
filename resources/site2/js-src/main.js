var Bottle = require("bottlejs");

var bottle = new Bottle();
bottle.value("domUtil", require("custom/domUtil"));

window.ylcSite = bottle.container;