$(document).ready(function() {
    if(!cacheStore.Exists("Commits")) {
        var gitUserObj = new gitUser("Elasticated-Shoe");
        
        gitUserObj.GetStats().then(function() {
            cacheStore.Store("Repos", gitUserObj.Repos);
            cacheStore.Store("Commits", gitUserObj.Commits);
            cacheStore.Store("Issues", gitUserObj.Issues);
            
            console.log("Table Generated From GIT API");

            graphIt.Table(gitUserObj.Commits);
            graphIt.Bar(gitUserObj.Commits);
        });
    }
    else {
        console.log("Table Generated From GIT Cache");

        graphIt.Table(cacheStore.Keys["Commits"]);
        graphIt.Bar(cacheStore.Keys["Commits"]);
    }
});