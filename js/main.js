let SVG_URL = "http://www.w3.org/2000/svg";
let REFS = {
    title: null,
    map: null
};
REFS.map = $('#map');

// 0==CLOSEST PATH, 1==GRAHAM_SCAN, 2==FIND_THE_WAY
let MODE = 0;

let pointsCount = 0;

$(document).ready(function() {
    $('#map-container').on('click', function(event) {
        //console.log(event);
        addPoint(event);
    });
});

function addPoint(ev) {

    if (MODE !== 0) { return; }

    let clickX = ev.pageX - 15;
    let clickY = ev.pageY - 100;

    let newPoint = document.createElementNS(SVG_URL, 'circle');
    newPoint.setAttributeNS(null, 'r', 3);
    newPoint.setAttributeNS(null, 'cx', clickX);
    newPoint.setAttributeNS(null, 'cy', clickY);
    $(newPoint).addClass('point');
    $(newPoint).attr('id', `point-${pointsCount}`);
    pointsCount++;

    $('#map').append(newPoint);

    // console.log('X:');
    // console.log(ev.pageX - clickX);
    // console.log('Y:');
    // console.log(ev.pageY - clickY);


    //console.log(event.originalEvent.clickY);
}
