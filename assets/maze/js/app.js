// screenObject is defined in gameMenu.js

var dataHandler = (function () {
    var fetchData = function(storageKey, returnObject = true) {
        var storageValue = localStorage.getItem(storageKey);
        if(storageValue === null) { // case for not created
            return false
        }
        if(returnObject) {
            return JSON.parse(storageValue);
        }
        return storageValue;
    };
    var storeData = function(storageKey, storageValue, returnObject = true) {
        if(returnObject) {
            var storageValue = JSON.stringify(storageValue);
        }
        localStorage.setItem(storageKey, storageValue);
    };
    return {
        get: fetchData,
        set: storeData,
    };
})();

var templateHandler = (function () {
    var renderTemplate = function(templateSelector, vars) {
        var template = _.template($(templateSelector).html());
        var html = template(vars());
        $("#content-container").html(html);
        $("#content-container").foundation(); // new templates may have foundation elements that need checking for
    };
    var registerTemplateCallbacks = function(callbackFunction, args) {
        callbackFunction.apply(null, args);
    }
    return {
        render: renderTemplate,
        callback: registerTemplateCallbacks
    };
})();

// screenHandler is essentially our router
var screenHandler = (function () {
    var currentScreen = "";
    var previousScreen = "";
    
    var goToScreen = function(screenName) {
        templateHandler.render(screenObject[screenName].template, screenObject[screenName].data);
        templateHandler.callback(screenObject[screenName].callback);
        if(screenHandler.current !== screenName) {
            screenHandler.previous = screenHandler.current;
            screenHandler.current = screenName;
        }
    }

    return {
        set current (value) { currentScreen = value; },
        get current () { return currentScreen; },
        set previous (value) { previousScreen = value; },
        get previous () { return previousScreen; },
        navigate: goToScreen
    };
})();

$(window).on("error", function (error) {
    // could prevent default
    console.log(error)
    //alert("Something Went Wrong!");
});

$(document).ready(function(){
    $(document).foundation();
    screenHandler.navigate("Home");
});