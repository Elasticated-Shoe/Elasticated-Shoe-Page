screenObject = {
    // template to render the page with, data for that template and callback to run on page load
    "Home": {
        "template": "#start-screen",
        "data": function() {

        },
        "callback": function() {
            $('.start-menu-item-first h1 a, .start-menu-item h2 a').click(function () {
                screenHandler.navigate($(this).data("page"));
            });
        }
    },
    "Leaderboard": {
        "template": "#score-screen",
        "data": function() {

        },
        "callback": function() {
            $('.back-arrow').click(function () {
                screenHandler.navigate(screenHandler.previous);
            });
        }
    },
    "game": {
        "template": "#game-screen",
        "data": function() {
            return {}
        },
        "callback": function() {
            canvasWidth = $("#canvas-container").width();
            canvasHeight = $("#canvas-container").height();
            $.each($("canvas"), function(index, aCanvas) {
                // using jQuery $(aCanvas).width(canvasWidth) stretches the canvas element instead of making it larger
                aCanvas.width = canvasWidth;
                aCanvas.height = canvasHeight;
            });
            canvasPlayerElement = document.querySelector("#mob-canvas");
            playerDrawContext = canvasPlayerElement.getContext("2d");

            canvasMapElement = document.querySelector("#game-canvas");
            mapDrawContext = canvasMapElement.getContext("2d");
            game.init();
        }
    },
    "viewSave": {
        "template": "#view-screen",
        "data": function() {
            return {
                "pageTitle": "Saved Games",
                "dataObj": dataHandler.get("Saves"),
                "buttons": {
                    "Play": "button-play",
                    "New": "button-new",
                    "Load": "button-load",
                    "Delete": "button-del"
                }
            }
        },
        "callback": function() {
            $('#button-play').click(function () {
                
            });
            $('#button-new').click(function () {
                screenHandler.navigate("viewConfig");
            });
            $('#button-load').click(function () {

            });
            $('#button-del').click(function () {

            });

            $('.back-arrow').click(function () {
                screenHandler.navigate(screenHandler.previous);
            });
        }
    },
    "viewConfig": {
        "template": "#view-screen",
        "data": function() {
            return {
                "pageTitle": "Saved Templates",
                "dataObj": dataHandler.get("Configs"),
                "buttons": {
                    "Use": "button-use",
                    "New": "button-new",
                    "Delete": "button-del"
                }
            }
        },
        "callback": function() {
            $(document).on("submit", function(event) {
                event.preventDefault();

                var values = {};
                $.each($('#' + event.target.id).serializeArray(), function(index, field) {
                    values[field.name] = field.value;
                });

                allConfigs = dataHandler.get("Configs");
                if(!allConfigs) {
                    allConfigs = {};
                }
                configName = values["name"];
                allConfigs[configName] = values;
                allConfigs[configName]["created"] = Date.now() / 1000;
                dataHandler.set("Configs", allConfigs);
                $('#config-modal').foundation('close');
                screenHandler.navigate(screenHandler.current);

            });
            $('#button-new').click(function () {
                $('#config-modal').foundation('open');
            });
            $('#button-use').click(function () {
                var selectedConfig = $(".selected > div").data("name");
                var configObj = dataHandler.get("Configs");
                window.config = configObj[selectedConfig];

                // map config to objects // TEMP
                player.prop.speed = window.config.speed;

                screenHandler.navigate("game");
            });
            $('#button-del').click(function () {
                var keyToRemove = $(".selected > div").data("name");
                var configObj = dataHandler.get("Configs");
                delete configObj[keyToRemove];
                dataHandler.set("Configs", configObj);
                screenHandler.navigate(screenHandler.current);
            });

            $('.back-arrow').click(function () {
                screenHandler.navigate(screenHandler.previous);
            });
            $('.selectable-items > div').click(function () {
                $.each($('.selectable-items > div'), function(index, element) {
                    $(element).removeClass("selected");
                })
                $(this).toggleClass("selected");
            });
        }
    }
}