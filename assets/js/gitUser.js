// https://medium.com/@Rahulx1/revealing-module-pattern-tips-e3442d4e352

var gitUser = (function(user) {
    // Private Members
    var apiUrl = "https://api.github.com/users/";
    
    // Public Members
    var username = user,
        userRepos = [],
        userCommits = [];
        userIssues = [];

    // Private Methods
    function fetchRepos() {
        return $.get(apiUrl + username + "/repos", function(gitData) {
            userRepos = gitData;
        });
    }
    function fetchCommits() {
        promiseList = [];
        for(var repoIndex = 0; repoIndex < userRepos.length; repoIndex++) {
            var repoCommitsUrl = userRepos[repoIndex]["commits_url"].replace("{/sha}", "")
            var promise = $.get(repoCommitsUrl, function(repoCommitList) {
                userCommits = userCommits.concat(repoCommitList);
            });
            promiseList.push(promise);
        }

        return promiseList;
    }
    function fetchIssues() {
        promiseList = [];
        for(var repoIndex = 0; repoIndex < userRepos.length; repoIndex++) {
            var repoIssuesUrl = userRepos[repoIndex]["issues_url"].replace("{/number}", "")
            var promise = $.get(repoIssuesUrl, function(repoIssueList) {
                userIssues = userIssues.concat(repoIssueList);
            });
            promiseList.push(promise);
        }

        return promiseList;
    }

    // Public Methods
    function fetchStats() {
        var statsPromise = $.Deferred();

        $.when( fetchRepos() ).then( function() {
            var commitPromises = fetchCommits(),
                issuesPromises = fetchIssues();

            var allPromises = commitPromises.concat(issuesPromises);

            $.when.apply($, allPromises).then( function() {
                statsPromise.resolve();
            }, function() {
                // error for fetching commits / issues
                statsPromise.reject()
            });
        }, function() {
            // error for fetching repos
            statsPromise.reject()
        } );

        return statsPromise;
    }
   
    // Public members/methods exposed in return statement
    return {
        get Username() {
            return user;
        },
        get Repos() {
            return userRepos;
        },
        get Commits() {
            return userCommits;
        },
        get Issues() {
            return userIssues;
        },
        GetStats: fetchStats
    };
});