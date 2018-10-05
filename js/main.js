let SVG_URL = "http://www.w3.org/2000/svg";
let REFS = {
    title: null,
    map: null
};
REFS.map = $('#map');

// 0==CLOSEST PATH, 1==GRAHAM_SCAN, 2==FIND_THE_WAY
let MODE = 0;
let canAdd = true;

let originalPoints = [
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
let points = [];
let pointsCount = 0;

$(document).ready(function() {
    $('#map-container').on('click', function(event) {
        //console.log(event);
        addPoint(event);
    });
});

function addPoint(ev) {
    if (MODE !== 0 || !canAdd) { return; }

    let clickX = ev.pageX - 15;
    let clickY = ev.pageY - 100;

    let roundedX = parseFloat(clickX.toFixed(1));
    let roundedY = parseFloat(clickX.toFixed(1));
    let point = {
        id: `point-${pointsCount}`,
        x: roundedX,
        y: roundedY
    };
    points.push(point);
    let circle = drawCircle(clickX, clickY);
    $('#map').append(circle);

    // console.log('X:');
    // console.log(clickX);
    // console.log('Y:');
    // console.log(clickY);


    //console.log(event.originalEvent.clickY);
}

function drawCircle(posX, posY) {
    let newPoint = document.createElementNS(SVG_URL, 'circle');
        newPoint.setAttributeNS(null, 'r', 3);
        newPoint.setAttributeNS(null, 'cx', posX);
        newPoint.setAttributeNS(null, 'cy', posY);

    $(newPoint).addClass('point');
    $(newPoint).attr('id', `point-${pointsCount}`);
    newPoint.addEventListener('mouseover', function() {
        console.log($(newPoint).attr('id'));
    });
    pointsCount++;

    return newPoint;
}

function presetPoints(ev) {
    ev.stopPropagation();

    // Get SVG map size
    let map = REFS.map[0].getBoundingClientRect();
    let posX = map.width/ 30;
    let posY = map.height/ 30;

    // Reset points and convert coordinates no px
    if (points) { points = []; }
    pointsCount = 0;
    for (let i = 0; i < originalPoints.length; i++) {
        let pointX = (originalPoints[i].x + 15) * posX;
        let pointY = map.height - ((originalPoints[i].y + 15) * posY);

        let roundedX = parseFloat(pointX.toFixed(1));
        let roundedY = parseFloat(pointY.toFixed(1));

        let point = {
            id: `point-${pointsCount}`,
            x: roundedX,
            y: roundedY
        };

        points.push(point);

        let circle = drawCircle(pointX, pointY);
        $('#map').append(circle);
    }

    //console.log(points);
    //console.log(originalPoints);
    //console.log(pointsCount);
}

function findClosestPair() {
    if (!points) { return; }

    // Order by X
    let orderedPoints = sortArrayByXandY(points);

    console.log(divideAndConquer(0, orderedPoints.length));
}

function sortArrayByXandY(arr) {
    arr.sort(function(a, b) {
        if (a.x - b.x === 0) {
            return a.y - b.y;
        }
        return a.x - b.x;
    });

    return arr;
}

function sortArrayByY(arr) {
    arr.sort(function(a, b) {
        return a.y - b.y;
    });

    return arr;
}

function divideAndConquer(start, end) {
    let delta;

    if (end - start <= 3) {
        // 2 or 3 points = BRUTE FORCE
        if (end -start === 2) {
            let a = points[start];
            let b = points[end - 1];

            console.log('2 points');
            console.log(a.id);
            console.log(b.id);
            console.log(dist(a, b));
            return dist(a, b);
        }
        else {
            let a = points[start];
            let b = points[start + 1];
            let c = points[end - 1];

            let ab = dist(a, b);
            let ac = dist(a, c);
            let bc = dist(b, c);

            let dmin = Math.min(ab, ac, bc);

            console.log('3 points');
            if (dmin === ab) { console.log(ab); return ab; }
            else if (dmin === ac) { console.log(ac); return ac; }
            else { console.log(bc); return bc; }
        }
    } else {
        let m = parseInt((start + end) / 2);
        console.log('start');
        console.log(start);
        console.log('end');
        console.log(end);
        console.log('middle');
        console.log(m);

        let dminL = divideAndConquer(start, m);
        let dminR = divideAndConquer(m, end);

        if (dminL < dminR) { delta = dminL; }
        else { delta = dminR; }

        console.log('delta');
        console.log(delta);
        return delta;
    }
}

function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
