let SVG_URL = "http://www.w3.org/2000/svg";
let REFS = {
    title: null,
    map: null
};
REFS.map = $('#map');

// 0==CLOSEST PATH, 1==GRAHAM_SCAN, 2==FIND_THE_WAY
let MODE = 0;

let originalPoints = [];
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

function presetPoints() {
    if (originalPoints) { originalPoints = []; }

    originalPoints = [
        {x: -13.0, y: 0.5},
        {x: -10.5, y: -11.5},
        {x: -10.0, y: 9.0},
        {x: -4.5,  y: -2.0},
        {x: -1.0,  y: 8.5},
        {x: 0.5,   y: 6.0},
        {x: 0.5,   y: -12},
        {x: 2.0,   y: 12.5},
        {x: 3.5,   y: 11.0},
        {x: 5.5,   y: 3.0},
        {x: 5.5,   y: -7.0},
        {x: 5.0,   y: 11.5},
        {x: 6.5,   y: 3.2},
        {x: 7.0,   y: -10.0},
        {x: 9.0,   y: -5.0},
        {x: 11.5,   y: -4.0},
    ];

    pointsCount = originalPoints.length;

    console.log(originalPoints);
    console.log(pointsCount);
}
