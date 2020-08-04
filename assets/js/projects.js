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

function formatForIssuesTemplate(gitRepos, gitIssues) {
    var repoIssues = {},
        repoNameUrlLookup = {};

    for(repoIndex in gitRepos) {
        var reporUrl = gitRepos[repoIndex]["url"],
            repoName = gitRepos[repoIndex]["name"];

        repoNameUrlLookup[reporUrl] = repoName;
    }
    for(issueIndex in gitIssues) {
        var issueRepoName = repoNameUrlLookup[ gitIssues[issueIndex]["repository_url"] ];

        if(!(issueRepoName in repoIssues)) {
            repoIssues[issueRepoName] = [];
        }
        repoIssues[issueRepoName].push(gitIssues[issueIndex]);
    }

    return repoIssues;
}

$(document).ready(function(){
    if(!cacheStore.Exists("Commits")) {
        var gitUserObj = new gitUser("Elasticated-Shoe");
        
        gitUserObj.GetStats().then(function() {
            cacheStore.Store("Repos", gitUserObj.Repos);
            cacheStore.Store("Commits", gitUserObj.Commits);
            cacheStore.Store("Issues", gitUserObj.Issues);
            
            console.log("Table Generated From GIT API");

            var formattedIssues = formatForIssuesTemplate(gitUserObj.Repos, gitUserObj.Issues);
            generateIssueLabels(formattedIssues);
            updatePageLinks(formattedIssues);
        });
    }
    else {
        console.log("Table Generated From GIT Cache");

        var formattedIssues = formatForIssuesTemplate(cacheStore.Keys["Repos"], cacheStore.Keys["Issues"]);
        generateIssueLabels(formattedIssues);
        updatePageLinks(formattedIssues);
    }
});