function getPos(obj) {
    var x = 0, y = 0;

    while(obj.offsetParent) {
        x += obj.offsetLeft;
        y += obj.offsetTop;
        obj = obj.offsetParent;
    }

    return {x: x, y: y};
}