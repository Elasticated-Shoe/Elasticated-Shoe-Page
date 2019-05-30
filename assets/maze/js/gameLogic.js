var game = (function() {
    var preGameLoop = function setup() {
        // setup controls
        $(document).mousedown(function(event) {
            if(event.which === 1) {
                player.prop.destination.x = event.clientX;
                player.prop.destination.y = event.clientY - $(".header-container").height(); // remove height of navbar
                player.prop.intersect = collision.check(player, staticObjBound);
            }
        });
        // setting up the player and the map before the game begins
        player.draw();
        map.draw();
        // work out lines of all shapes to use in collision detection
        staticObjBound = collision.init();
        gameLoop(); // enter gameloop
    };
    var gameLoop = function start() {
        function gameTick() {
            // called every 10ms
            if(player.prop.destination.x !== player.prop.position.x && player.prop.destination.y !== player.prop.position.y) {
                // only check for collisions if the player is moving
                collisionPoints = player.prop.intersect; // possible collisions array set on mousedown
                for(index in collisionPoints) {
                    var collisionPointCoord = collisionPoints[index]["coords"];
                    var diffX = Math.abs( collisionPointCoord[0] - player.prop.position.x );
                    var diffY = Math.abs( collisionPointCoord[1] - player.prop.position.y );
                    // due to floats and divisions of pixels collision points and the point the player will actually
                    // traverse are slightly offset, working out the difference and using playerspeed as margin of error
                    // increase the accuracy of detecting the collision
                    if(diffX < player.prop.speed && diffY < player.prop.speed) {
                        // run the collision function associated with the object
                        var blockType = collisionPoints[index]["blockType"]
                        blockTypes[blockType].collision(player);
                    }
                }
            }
            moveToPoint.direct(player);
            player.draw();
        }
        setInterval(gameTick, 10);
    }
    return {
        init: preGameLoop
    };
})();

var player = (function() {
    var playerSpeed = 0; // overwritten, need init?
    var playerX = 100;
    var playerY = 100;

    var desX = 100;
    var desY = 100;

    var objectsInPath = [];

    var properties = {
        "canMove":  true,
        set intersect(newArray) {objectsInPath = newArray},
        get intersect() {return objectsInPath},
        set speed(newSpeed) {playerSpeed = newSpeed},
        get speed() {return playerSpeed},
        "position": {
            set x(x) {playerX = x},
            set y(y) {playerY = y},
            get x() {return playerX},
            get y() {return playerY}
        },
        "destination": {
            set x(x) {desX = x},
            set y(y) {desY = y},
            get x() {return desX},
            get y() {return desY}
        }
    };

    var drawPlayer = function() {
        playerDrawContext.clearRect(0, 0, 2000, 2000);
        playerDrawContext.beginPath();
        playerDrawContext.arc(properties.position.x, properties.position.y, 15.0, 0, 2 * Math.PI, false);
        playerDrawContext.fillStyle = "red";
        playerDrawContext.fill(); // actually draws
    };
    
    return {
        prop: properties,
        draw: drawPlayer
    };
})();

var geometry = (function() {
    var pythagoras = function(startX, startY, endX, endY) {
        // a^2 = b^2 + c^2 where a is the hypotenuse length
        bSquared = Math.pow(endX - startX, 2);
        cSquared = Math.pow(endY - startY, 2);
        aSquared = bSquared + cSquared;
        return Math.sqrt(aSquared);
    };
    return {
        pythagoras: pythagoras,
    };
})();

var moveToPoint = (function() {
    var sanityCheckCoords = function(startX, startY, endX, endY) {
        // if coordinates are the same no need to move the object
        if(startX === endX && startY === endY) {
            return true
        }
        return false
    };
    var straightLine = function(movingObj) {
        // moves the object to a straight line towards its destination point
        // (xt,yt)=( ( (1−t)x0+tx1 ), ( ( 1−t) y0+ty1 ) )
        // equation for a point on a line segment where t is the ratio of the distance you want to move / length of line
        startX = movingObj.prop.position.x;
        startY = movingObj.prop.position.y;

        endX = movingObj.prop.destination.x;
        endY = movingObj.prop.destination.y;

        if(sanityCheckCoords(startX, startY, endX, endY)) {return false} // dont move if no need
        totalDis = geometry.pythagoras(startX, startY, endX, endY);
        if(totalDis <= movingObj.prop.speed) { // if the movement distance is less than the minimum just move to point
            movingObj.prop.position.x = endX;
            movingObj.prop.position.y = endY;
        }
        else {
            distanceRatio = movingObj.prop.speed / totalDis;
            newX = (1 - distanceRatio) * startX + distanceRatio * endX;
            newY = (1 - distanceRatio) * startY + distanceRatio * endY;
            movingObj.prop.position.x = newX;
            movingObj.prop.position.y = newY;
        }
    };
    return {
        direct: straightLine
    };
})();

var collision = (function() {
    var getLines = function() {
        // uses the map object to work out all the lines making up the objects in a map
        // currently only supports rectangles
        var mapObjectArray = map.contents
        var lines = [];
        for(mapObjectIndex in mapObjectArray) {
            // lines of shape are a combination of every vertice - the internal lines
            var startX = mapObjectArray[mapObjectIndex].x;
            var endX = startX + mapObjectArray[mapObjectIndex].width;
            
            var startY = mapObjectArray[mapObjectIndex].y;
            var endY = startY + mapObjectArray[mapObjectIndex].height;

            var possibleX = [startX, endX];
            var possibleY = [startY, endY];

            var corners = [];
            for(xIndex in possibleX) {
                for(yIndex in possibleY) {
                    corners.push([possibleX[xIndex], possibleY[yIndex]])
                }
            }
            // square has four lines // could be worked out dynamically to account for other shapes
            lines.push({
                "blockType": mapObjectArray[mapObjectIndex]["blockType"],
                "coords": [ [ corners[0][0], corners[0][1] ], [ corners[2][0], corners[2][1] ] ]
            });
            lines.push({
                "blockType": mapObjectArray[mapObjectIndex]["blockType"],
                "coords": [ [ corners[0][0], corners[0][1] ], [ corners[1][0], corners[1][1] ] ]
            });
            lines.push({
                "blockType": mapObjectArray[mapObjectIndex]["blockType"],
                "coords": [ [ corners[3][0], corners[3][1] ], [ corners[2][0], corners[2][1] ] ]
            });
            lines.push({
                "blockType": mapObjectArray[mapObjectIndex]["blockType"],
                "coords": [ [ corners[3][0], corners[3][1] ], [ corners[1][0], corners[1][1] ] ]
            });
        }
        return lines
    }
    var checkTwoObjects = function(mobObject, mapLines) {
        // equation of line y=mx+c. if line intersects y is equal, mx+c==mx+c will be true
        // however this is for lines of infinite length, will always intersect unless perfectly parallel.
        // must work out if line segments intersect instead // more complex collision test would be seperating axis
        // or just check if intersect point is within line // lazy
        var startX = mobObject.prop.position.x;
        var startY = mobObject.prop.position.y;
        var endX = mobObject.prop.destination.x;
        var endY = mobObject.prop.destination.y;
        if(startX === endX && startY === endY) { // object is not going anywhere
            return false
        }
        // get direction of movement
        var xAxisDir = "-";
        if(endX > startX) {
            xAxisDir = "+";
        }
        var yAxisDir = "+";
        if(endY > startY) {
            yAxisDir = "-";
        }
        playerGradient = (endY - startY) / (endX - startX); //delta y over delta x
        yIntersectPlayer = startY - (playerGradient*startX); // y=mx+c so y-mx=c
        collisions = [];
        for(lineIndex in mapLines) {
            var aLine = mapLines[lineIndex].coords;
            var shapeGradient = (aLine[1][1] - aLine[0][1]) / (aLine[1][0] - aLine[0][0]);
            if(shapeGradient === -0) {
                shapeGradient = 0;
            }
            if(!isFinite(shapeGradient)) { // intersect of vertical straight line is different
                // intersect x value is always the x value of the vertical line
                intersectX = aLine[1][0];
            }
            else { // otherwise two non parrallel lines
                // m(1)x(1)+c(1) === m(2)x(2)+c(2) so x = ( c(2) - c(1) ) / ( m(1) - m(2) ); c is intersect, m is gradient
                var yIntersectShape = aLine[0][1] - (shapeGradient*aLine[0][0]);
                intersectX = (yIntersectShape - yIntersectPlayer) / (playerGradient - shapeGradient);
            }
            intersectY = playerGradient*intersectX + yIntersectPlayer;
            // now check if the possible collision points are on our line segment
            xLowerBound = Math.min.apply(null, [aLine[1][0], aLine[0][0]]);
            xUpperBound = Math.max.apply(null, [aLine[1][0], aLine[0][0]]);
            yLowerBound = Math.min.apply(null, [aLine[1][1], aLine[0][1]]);
            yUpperBound = Math.max.apply(null, [aLine[1][1], aLine[0][1]]);
            if(intersectX <= xUpperBound && intersectX >= xLowerBound) {
                if(intersectY <= yUpperBound && intersectY >= yLowerBound) { // collision point within shape boundry
                    // exclude collisions that are not in the direction of movement
                    // this stops the object sticking to walls it collides with
                    var xLineDir = "-";
                    if(intersectX > startX) {
                        xLineDir = "+";
                    }
                    var yLineDir = "+";
                    if(intersectY > startY) {
                        yLineDir = "-";
                    }
                    if(xAxisDir === xLineDir && yAxisDir === yLineDir) {
                        collisions.push({
                            "blockType": mapLines[lineIndex].blockType,
                            "coords": [intersectX, intersectY]
                        }); // add the blockType of the object the line was created from so we can use methods for it
                    }
                }
            }
        }
        return collisions
    };
    return {
        init: getLines,
        check: checkTwoObjects
    };
})();