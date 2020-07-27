var cacheStore = (function() {
    // constructor
    if(localStorage.getItem("keyValueStore") === null) {
        var defaultKeyValueStore = {
            Expires: {},
            Keys: {}
        }
        localStorage.setItem( "keyValueStore", JSON.stringify(defaultKeyValueStore) );
    }

    // Public Members
    var keyValueStore = JSON.parse( localStorage.getItem("keyValueStore") );

    // Private Methods
    function updateStore() {
        var keyValueStoreStr = JSON.stringify(keyValueStore);
        localStorage.setItem("keyValueStore", keyValueStoreStr);
    }

    // Public Methods
    function isCached(key) {
        return key in keyValueStore["Keys"] && Date.now() - keyValueStore["Expires"][key] <= 600000; // Refresh GIT cache every 10 minutes
    }
    function storeValue(key, value) {
        keyValueStore["Keys"][key] = value;
        keyValueStore["Expires"][key] = Date.now();

        updateStore();
    }
    function removeValue(key) {
        delete keyValueStore["Keys"][key];
        delete keyValueStore["Expires"][key];

        updateStore();
    }
    // Public members/methods exposed in return statement
    return {
        get Keys() {
            return keyValueStore["Keys"];
        },
        Exists: isCached,
        Store: storeValue,
        Delete: removeValue
    };
})();