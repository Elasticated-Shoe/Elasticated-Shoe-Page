function generateIssueLabels(data) {
    var template = $('#gitIssuesTemplate').html()
    var compiledTemplate = _.template(template);
    var templateMarkup = compiledTemplate({repoName: data});
    $('#gitIssuesTemplateContent').html(templateMarkup);
}

function updatePageLinks(data) {
    var compiledTemplate = _.template('<% for(name in repoName)  { %><li><a href="#<%= name %>"><%= name %></a></li><% } %>');
    var templateMarkup = compiledTemplate({repoName: data});
    $('.page-links').html(templateMarkup);
}

function defer(method) {
    if (window.jQuery) {
        method();
    } else {
        setTimeout(function() { defer(method) }, 10);
    }
}
  
// script load is async, wait for jquery
defer(function() {
    $(document).ready(function(){
        var issuesCacheTime = localStorage.getItem("issuesGetTime");
        // if cache old, refresh
        if(Date.now() - issuesCacheTime > 600000) {
            console.log("Regenerating Cache");
            $.get("https://api.github.com/users/Elasticated-Shoe/repos", function(gitData) {
                var repoIssues = {};
                var promises = [];
                // create promises for each repo
                for(repo in gitData) {
                    var repoName = gitData[repo]["name"]
                    var repoIssuesUrl = gitData[repo]["issues_url"].replace("{/number}", "")
                    var promise = $.ajax({
                        url: repoIssuesUrl,
                        customParam: repoName,
                        success: function(issueData) {
                            repoName = this.customParam;
                            repoIssues[repoName] = [];
                            for(issue in issueData) {
                                issueLabel = issueData[issue]["labels"][0]["name"];
                                issueState = issueData[issue]["state"];
                                if(issueLabel === "Description") {
                                    issueUrl = issueData[issue]["repository_url"];
                                }
                                else {
                                    issueUrl = issueData[issue]["url"];
                                }
                                issueBody = issueData[issue]["body"];
                                issueTitle = issueData[issue]["title"];
                                issueComments = issueData[issue]["comments_url"];
                                issueUser = issueData[issue]["user"]["login"];
                                issueCreation = issueData[issue]["created_at"];
                                repoIssues[repoName].push({
                                    "Label": issueLabel,
                                    "Text": issueBody,
                                    "Title": issueTitle,
                                    "Url": issueUrl,
                                    "State": issueState,
                                    "Comments": issueComments,
                                    "Author": issueUser,
                                    "Created": issueCreation
                                });
                            }
                        }
                    });
                    promises.push(promise);
                }
                // this way waits until all promises are executed before executing callback, we can be certain all the data will be available
                Promise.all(promises).then(function() {
                    // store data in local storage as cache
                    localStorage.setItem("repoIssues", JSON.stringify(repoIssues));
                    localStorage.setItem("issuesGetTime", Date.now());
                    // generate table
                    generateIssueLabels(repoIssues);
                    updatePageLinks(repoIssues);
                    $("#mobileMessage").html("Using GIT API");
                });
            });
        }
        else {
            console.log("Using Cache");
            var repoIssues = JSON.parse(localStorage.getItem("repoIssues"));
            $("#mobileMessage").html("Using GIT Cache");
            // generate table
            generateIssueLabels(repoIssues);
            updatePageLinks(repoIssues);
        }
    });
});