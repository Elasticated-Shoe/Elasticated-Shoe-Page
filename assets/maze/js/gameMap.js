var blockTypes = (function() {
    var drawRectangle = function(mapObject, colour) {
        mapDrawContext.beginPath();
        mapDrawContext.rect(mapObject.x, mapObject.y, mapObject.width, mapObject.height);
        mapDrawContext.fillStyle = colour;
        mapDrawContext.fill(); // actually draws
    }

    var wall = (function() {
        var drawWall = function(mapObject) {
            drawRectangle(mapObject, "black");
        }
        var onCollision = function(collidingObject) {
            // for a wall, stop the player
            collidingObject.prop.destination.x = collidingObject.prop.position.x;
            collidingObject.prop.destination.y = collidingObject.prop.position.y;
            console.log("You have hit a wall");
        }
        return {
            draw: drawWall,
            collision: onCollision
        }
    })();

    var exit = (function() {
        var drawExit = function(mapObject) {
            drawRectangle(mapObject, "green");
        }
        var onCollision = function(collidingObject) {
            // doesn't stop the player, but starts end of room code
            console.log("Game Over");
        }
        return {
            draw: drawExit,
            collision: onCollision
        }
    })();
    
    return {
        wall: wall,
        exit: exit
    };
})();

var map = (function() {
    // should be randomly generated
    var mapObjectsArray = [
        {
            "blockType": "wall",
            x: 0,
            y: 0,
            width: $("#content-container").width(),
            height: 20
        },
        {
            "blockType": "wall",
            x: 0,
            y: 20,
            width: 20,
            height: $("#content-container").height() - 20
        },
        {
            "blockType": "wall",
            x: $("#content-container").width() - 20,
            y: 20,
            width: 20,
            height: $("#content-container").height() - 20
        },
        {
            "blockType": "wall",
            x: 0,
            y: $("#content-container").height() - 20,
            width: $("#content-container").width(),
            height: 20
        },

        {
            "blockType": "wall",
            x: 500,
            y: 20,
            width: 20,
            height: 200
        },
        {
            "blockType": "wall",
            x: 700,
            y: 400,
            width: 20,
            height: $("#content-container").height() - 400 - 20
        },
        {
            "blockType": "wall",
            x: 900,
            y: 20,
            width: 20,
            height: 350
        },

        {
            "blockType": "exit",
            x: $("#content-container").width() - 220,
            y: $("#content-container").height() - 220,
            width: 200,
            height: 200
        },
    ]

    var generateMap = function() {
        
    };
    var drawMap = function() {
        for(mapObject in mapObjectsArray) {
            blockType = mapObjectsArray[mapObject]["blockType"];
            blockTypes[blockType].draw(mapObjectsArray[mapObject]);
        }
    };
    return {
        new: generateMap,
        draw: drawMap,
        contents: mapObjectsArray
    };
})();