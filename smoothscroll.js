(function(){
// We do not want this script to be applied in browsers that do not support those
// That means no smoothscroll on IE8 and below.
if(!document.querySelectorAll || window.pageYOffset === undefined) { return; }

// Get the top position of an element in the document 
var getTop = function(element) {
    var top = element.offsetTop;
    while (element = element.offsetParent) {
        top += element.offsetTop;
    }
    return top;
}
// ease in out function thanks to:
// http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
var easeInOutCubic = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }

// calculate the scroll position we should be in 
// given the start and end point of the scroll
// the time elapsed from the beginning of the scroll
// and the total time the scroll should last (default 500ms)
var position = function(start, end, elapsed, time) {
    if (elapsed > time) return end;
    return start + (end - start) * easeInOutCubic(elapsed / time); // <-- you can change the easing funtion there
    // return start + (end - start) * (elapsed / time); // <-- this would give a linear scroll
}

// We cannot rely on setInterval to execute a function at a regular interval
// The idea is to recalculate the position we should be at and scroll there directly
// every more or less 10ms.
// if the callback exist, it is called when the scrolling is finished
var smoothScroll = function(el, time, callback){
    time = time || 2000;
    var start = window.pageYOffset;
    var end = getTop(el);
    var clock = Date.now();
    var j = window.setInterval(function(){
        var elapsed = Date.now() - clock;
        window.scroll(0, position(start, end, elapsed, time));
        if (elapsed > time) {
            window.clearInterval(j);
            if (typeof callback === 'function') {
                callback(el);
            }
        }
    }, 10);
}

var linkHandler = function(ev) {
    ev.preventDefault();
    var hash = this.href.split('#').pop();
    window.history.pushState(null, null, '#' + hash)
    //using the history api to solve issue #1 - back doesn't work 
    // change the srolling time in this call
    smoothScroll(document.getElementById(hash), 500, function(el) {
        window.location.hash = el.id;
        // necessary if we want to use the :target selector.
        // the browser does not push a second state because the url hasn't changed.
    });
}

// We look for all the internal links in the documents and attach the smoothscroll function
document.addEventListener("DOMContentLoaded", function () {
    var internal = document.querySelectorAll('a[href^="#"]'), a;
    for(var i=internal.length; a=internal[--i];){
        a.addEventListener("click", linkHandler);
    }
});

})();