let SVG_URL = "http://www.w3.org/2000/svg";
let REFS = {
    title: null,
    map: null,
    btn_special: null
};
REFS.title = $('#title');
REFS.map = $('#map');
REFS.btn_special = $('#btn-special');

// 0==CLOSEST PATH, 1==GRAHAM_SCAN, 2==FIND_THE_WAY
let MODE = 0;

let canAdd = false;
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
        CreateClickPoint(event);
    });
});

/* BASE */
function CreateClickPoint(ev) {
    if (!canAdd) { return; }

    let clickX = ev.pageX - 15;
    let clickY = ev.pageY - 100;

    AddPoint(clickX, clickY);
}
function PresetPoints(ev) {
    ev.stopPropagation();

    // Get SVG map size
    let map = REFS.map[0].getBoundingClientRect();
    let posX = map.width/ 30;
    let posY = map.height/ 30;

    // Reset points and convert coordinates no px
    DeleteAllPoints();
    for (let i = 0; i < originalPoints.length; i++) {
        let pointX = (originalPoints[i].x + 15) * posX;
        let pointY = map.height - ((originalPoints[i].y + 15) * posY);

        AddPoint(pointX, pointY);
    }
}
function AddPoint(x, y) {
    let roundedX = parseFloat(x.toFixed(1));
    let roundedY = parseFloat(y.toFixed(1));
    let point = {
        id: `point-${pointsCount}`,
        x: roundedX,
        y: roundedY
    };
    points.push(point);
    DrawCircle(roundedX, roundedY);
    pointsCount++;
}
function DrawCircle(posX, posY) {
    let newPoint = document.createElementNS(SVG_URL, 'circle');
        newPoint.setAttributeNS(null, 'r', 3);
        newPoint.setAttributeNS(null, 'cx', posX);
        newPoint.setAttributeNS(null, 'cy', posY);

    $(newPoint).addClass('point');
    $(newPoint).attr('id', `point-${pointsCount}`);
    newPoint.addEventListener('mouseover', function() {
        console.log($(newPoint).attr('id'));
        console.log($(newPoint).attr('cx'));
        console.log($(newPoint).attr('cy'));
    });

    $('#map').append(newPoint);
}
function DrawConvexHull(points) {
    if (!points) { return; }

    let convexHull = document.createElementNS(SVG_URL, 'polyline');
        convexHull.setAttributeNS(null, 'points', '');

    let setOfPs = convexHull.getAttribute('points');
    for (let i = 0; i <= points.length; i++) {
        if (i === points.length) {
            setOfPs += `${points[0].x}, ${points[0].y} `;
        } else {
            setOfPs += `${points[i].x}, ${points[i].y} `;
        }
    }
    convexHull.setAttribute('points', setOfPs);

    $(convexHull).addClass('hull');
    $(convexHull).attr('id', `convex-hull-svg`);

    $('#map').append(convexHull);
}
function DrawLine(p1, p2, class_name) {
    let line = document.createElementNS(SVG_URL, 'line');
        line.setAttributeNS(null, 'x1', p1.x);
        line.setAttributeNS(null, 'x2', p2.x);
        line.setAttributeNS(null, 'y1', p1.y);
        line.setAttributeNS(null, 'y2', p2.y);

    $(line).addClass(class_name);
    $(line).attr('id', `line-${p1.id}-${p2.id}`);

    $('#map').append(line);
}


/* CLOSEST PAIR OF POINTS */
function FindClosestPair() {
    if (points.length === 0) { return; }
    console.log(points);

    // If there are any highlighted points
    REFS.map.children('.active').removeClass('active');

    // Order by X (resolve ties by Y)
    let orderedPointsByX = SortArrayByXandY(points);
    let deltaObj = DivideAndConquer(0, orderedPointsByX.length);

    $(`#${deltaObj.id1}`).addClass('active');
    $(`#${deltaObj.id2}`).addClass('active');
}
function DivideAndConquer(start, end) {
    let deltaObj;

    if (end - start <= 3) {
        // 2 or 3 points = BRUTE FORCE
        if (end - start === 2) {
            let a = points[start];
            let b = points[end - 1];

            return Dist(a, b);
        }
        else {
            let a = points[start];
            let b = points[start + 1];
            let c = points[end - 1];

            let ab = Dist(a, b);
            let ac = Dist(a, c);
            let bc = Dist(b, c);

            let dmin = Math.min(ab.dist, ac.dist, bc.dist);

            if (dmin === ab.dist) { return ab; }
            else if (dmin === ac.dist) { return ac; }
            else { return bc; }
        }
    } else {
        // Divide into smaller arrays
        // and gets the smallest distance among them
        let m = parseInt((start + end) / 2);

        let dminL = DivideAndConquer(start, m);
        let dminR = DivideAndConquer(m, end);

        if (dminL.dist < dminR.dist) { deltaObj = dminL; }
        else { deltaObj = dminR; }

        // Check the middle section
        // and compares it with the previous dmin
        let mediumX = (points[m-1].x + points[m].x)/2;

        let pointsLeft = [];
        for (let i = start; i < m; i++) {
            if (points[i].x > mediumX - deltaObj.dist) {
                pointsLeft.push(points[i]);
            }
        }
        let pointsRight = [];
        for (let i = m; i < end; i++) {
            if (points[i].x < mediumX + deltaObj.dist) {
                pointsRight.push(points[i]);
            }
        }

        for (let i = 0; i < pointsLeft.length; i++) {
            for (let j = 0; j < pointsRight.length; j++) {
                let distMiddle = Dist(pointsLeft[i], pointsRight[j]);
                if (distMiddle.dist < deltaObj.dist) {
                    deltaObj = distMiddle;
                }
            }
        }

        return deltaObj;
    }
}


/* A-STAR */
function AStar() {
    // Find the bigger shortest distance
    let biggerShortestDist = 0;
    for (let i = 0; i < points.length; i++) {
        let shortestDistance = 0;

        for (let j = 0; j < points.length; j++) {
            if (shortestDistance === 0) {
                shortestDistance = Dist(points[i], points[j]).dist;
            } else {
                let dist = Dist(points[i], points[j]).dist;
                if (dist < shortestDistance) {
                    shortestDistance = dist;
                }
            }
        }

        if (shortestDistance > biggerShortestDist) {
            biggerShortestDist = shortestDistance;
        }
    }


    // Create the graph
    // From a copy of points, add the .siblings attribute to each element
    // Find the siblings of all the points
    let graph = [];
    $.each(points, function(index, point) {
        let copyOfPoint = {
            id: point.id,
            x: point.x,
            y: point.y,
            siblings: [],
            // f = total cost; g = cost to get to this node from the start; h = heuristics
            f: 0,
            g: 0,
            h: 0
        }
        graph.push(copyOfPoint);
    });
    for (let i = 0; i < graph.length - 1; i++) {
        for (let j = i + 1; j < graph.length; j++) {
            let dist = Dist(graph[i], graph[j]).dist;
            if (dist < biggerShortestDist) {
                graph[i].siblings.push(points[j].id);
                graph[j].siblings.push(points[i].id);

                DrawLine(points[i], points[j], 'graph-line');
            }
        }
    }


    let convexHullByGraham = GrahamScan(graph);


    //CalculatePaths(graph, convexHullByGraham[0], convexHullByGraham[0].mostDistantPoint);
    console.log(graph);
    console.log(convexHullByGraham);
}
function GrahamScan(points) {
    if (points.length === 0) { return; }
    let convexHull = [];

    // 3 or less points = no need to/can't find the hull
    if (points.length <= 3) {
        return points;
    }

    // Create a copy of the array and find the point
    // with the smaller y
    let restOfPoints = [];
    $.each(points, function(index, point) {
        let copyOfPoint = {
            id: point.id,
            x: point.x,
            y: point.y,
            siblings: point.siblings,
            g: point.g,
            f: point.f,
            h: point.h
        }
        restOfPoints.push(copyOfPoint);
    });
    let smallestY = restOfPoints[0];
    let indexSmallestY = 0;
    for (let i = 1; i < restOfPoints.length; i++) {
        if (restOfPoints[i].y == smallestY.y) {
            if (restOfPoints[i].x < smallestY.x) {
                smallestY = restOfPoints[i];
                indexSmallestY = i;
            }
        }
        else if (restOfPoints[i].y < smallestY.y) {
            smallestY = restOfPoints[i];
            indexSmallestY = i;
        }
    }

    // Removes that point from the new array
    restOfPoints.splice(indexSmallestY, 1);

    // Sets a 'graham angle' for each point
    // The new array is ordered by this angle afterwards
    for (let i = 0; i < restOfPoints.length; i++) {
        // Get a new coord for the point based on the pivot
        let tempX = restOfPoints[i].x - smallestY.x;
        let tempY = restOfPoints[i].y - smallestY.y;
        restOfPoints[i].grahamAngle = GetGrahamAngle(tempX, tempY);
    }
    restOfPoints.sort(function(a, b) {
        return a.grahamAngle - b.grahamAngle;
    });

    // Build the convex hull
    convexHull.push(smallestY);
    convexHull.push(restOfPoints[0]);
    for (let i = 1; i < restOfPoints.length; i++) {
        let ccw = CrossProduct(convexHull[convexHull.length - 2],
                                convexHull[convexHull.length - 1],
                                restOfPoints[i]);

        if (ccw === 0) {
            convexHull.pop();
            convexHull.push(restOfPoints[i]);
        } else if (ccw > 0) {
            convexHull.push(restOfPoints[i]);
        } else {
            do {
                convexHull.pop();
                ccw = CrossProduct(convexHull[convexHull.length - 2],
                                    convexHull[convexHull.length - 1],
                                    restOfPoints[i]);
            } while(ccw <= 0 && convexHull.length > 2);

            convexHull.push(restOfPoints[i]);
        }
    }

    // Find the most distant point to each element in the convex Hull
    for (let i = 0; i < convexHull.length; i++) {
        convexHull[i].mostDistantPoint = '';
        convexHull[i].pathToMostDistant = [];
        let biggestDistance = 0;

        for (let j = 0; j < convexHull.length; j++) {
            let dist = Dist(convexHull[i], convexHull[j]);
            if (dist.dist > biggestDistance) {
                convexHull[i].mostDistantPoint = convexHull[j].id;
                biggestDistance = dist.dist;
            }
        }

        DrawLine(convexHull[i], GetPointById(convexHull[i].mostDistantPoint, convexHull), 'most-distant');
    }

    DrawConvexHull(convexHull);
    return convexHull;
}
// function CalculatePaths(graph, start, end) {

//     // Clean and push the first point into the array
//     let openList = [];
//     let closedList = [];
//     openList.push(start); // array of points

//     while(openList.length > 0) {
//         let minIndex = 0;
//         for (let i = 0; i < openList.length; i++) {
//             if (openList[i].f < openList[minIndex].f) {
//                 minIndex = i;
//             }
//         }
//         let current = openList[minIndex]; // point

//         // Remove item from open and passes it to closed
//         openList.splice(minIndex, 1);
//         closedList.push(current);

//         // Analyze each sibling of the current node
//         let siblings = current.siblings;
//         for (let i = 0; i < siblings.length; i++) {
//             let sibling = GetPointById(siblings[i], graph); // point

//             // G is the shortest distance from start to current
//             let g = current.g + Dist(current, sibling).dist;
//             let bestG = false;
//             let found = FindNode(sibling, openList);

//             if (!found) {
//                 bestG = true;
//                 sibling.h = Dist(sibling, GetPointById(end, graph)).dist;
//                 openList.push(sibling);
//                 console.log(sibling);
//                 console.log(openList);
//             } else if (g < sibling.g) {
//                 bestG = true;
//             }

//             if (bestG) {
//                 closedList.push(sibling);
//                 sibling.g = g;
//                 sibling.f = sibling.g + sibling.h;
//             }
//         }
//     }

// }
function FindNode(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return true;
        }
    }
    return false;
}


/* AUX FUNCTIONS */
function SortArrayByXandY(arr) {
    arr.sort(function(a, b) {
        return (a.x - b.x === 0) ? a.y - b.y : a.x - b.x;
    });
    return arr;
}
function SortArrayByYandX(arr) {
    arr.sort(function(a, b) {
        return (a.y - b.y === 0) ? a.x - b.x : a.y - b.y;
    });
    return arr;
}
function Dist(p1, p2) {
    let dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

    let distObj = {
        id1: p1.id,
        id2: p2.id,
        dist: dist,
    }

    return distObj;
}
function GetCoordinatesById(id) {
    let x = $(`#${id}`).attr('cx');
    let y = $(`#${id}`).attr('cy');
    return coords = {
        x: x,
        y: y
    }
}
function GetPointById(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return arr[i];
        }
    }
    return null;
}
function GetGrahamAngle(x, y) {
    if (y === 0) {
        return 0;
    } else if (x > 0) {
        return Math.atan(y / x);
    } else if (x < 0) {
        return Math.atan(-x / y) + Math.PI/2;
    } else {
        return Math.PI/2;
    }
}
function CrossProduct(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}
function ChangeMode(num) {
    REFS.title.empty();
    REFS.btn_special.empty();
    if (num === 0) {
        REFS.title.append(
            `<span>c</span>
            <span>l</span>
            <span>o</span>
            <span>s</span>
            <span>e</span>
            <span>s</span>
            <span>t</span>
            <span>_</span>
            <span>p</span>
            <span>a</span>
            <span>i</span>
            <span>r</span>`);
        REFS.btn_special.append(
            `<button onclick="FindClosestPair();"><i class="fas fa-play"></i></button>
            <label>FIND CLOSEST PAIR</label>`
        );
    } else if (num === 1) {
        REFS.title.append(
            `<span>q</span>
            <span>u</span>
            <span>i</span>
            <span>c</span>
            <span>k</span>
            <span>_</span>
            <span>h</span>
            <span>u</span>
            <span>l</span>
            <span>l</span>`);
        REFS.btn_special.append(
            `<button onclick="FindQuickHull();"><i class="fas fa-play"></i></button>
            <label>FIND QUICK HULL</label>`
        );
    } else {
        REFS.title.append(
            `<span>f</span>
            <span>i</span>
            <span>n</span>
            <span>d</span>
            <span>_</span>
            <span>t</span>
            <span>h</span>
            <span>e</span>
            <span>_</span>
            <span>w</span>
            <span>a</span>
            <span>y</span>`);
        REFS.btn_special.append(
            `<button onclick="AStar();"><i class="fas fa-play"></i></button>
            <label>FIND THE WAY</label>`);
    }

    MODE = num;
}
function ToggleCreationPoint(el) {
    canAdd = !canAdd;
    if (canAdd) {
        console.log(true);
        $(el).addClass('active');
    } else {
        console.log(false);
        $(el).removeClass('active');
    }
}


/* RESET */
function DeleteAllPoints() {
    points = [];
    REFS.map.empty();
    pointsCount = 0;
}



