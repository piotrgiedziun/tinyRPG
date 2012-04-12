function getPos(obj) {
    var x = 0, y = 0;

    while(obj.offsetParent) {
        x += obj.offsetLeft;
        y += obj.offsetTop;
        obj = obj.offsetParent;
    }

    return {x: x, y: y};
}

function httpRequest(url, callback, reutrnJSON) {
	var xmlhttp;
	if (window.XMLHttpRequest) {
	  xmlhttp = new XMLHttpRequest();
	}else{
	  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function() {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200) {
	    callback(reutrnJSON?xmlhttp.responseText.evalJSON():xmlhttp.responseText);
	  }
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}