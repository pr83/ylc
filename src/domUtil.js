module.exports = (function () {

    function clone(domElement, fnPostprocess) {
        var domClone = domElement.cloneNode(false),
            idxChild;

        for (idxChild = 0; idxChild < domElement.childNodes.length; idxChild += 1) {
            domClone.appendChild(clone(domElement.childNodes[idxChild], fnPostprocess));
        }

        fnPostprocess(domElement, domClone);

        return domClone;
    }

    return {
        clone: clone
    };

}());