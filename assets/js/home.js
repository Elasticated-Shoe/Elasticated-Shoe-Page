$(document).ready(function(){
    $.get("https://api.github.com/users/Elasticated-Shoe/repos", function(gitData) {
        console.log(gitData);
        var allCommits = []
        var promises = [];
        for(repo in gitData) {
            var repoCommits = gitData[repo]["commits_url"].replace("{/sha}", "")
            var promise = $.get(repoCommits, function(commitData) {
                for(commit in commitData) {
                    allCommits.push(commitData[commit]);
                }
            });
	        promises.push(promise);
        }
        // this way waits until all promises are executed before executing callback
        Promise.all(promises).then(function() {
            console.log(allCommits);
            allCommits.sort(function(a,b){
                if(Date.parse(a.commit.author.date) > Date.parse(b.commit.author.date)) {
                    return 1;
                }
                return 0;
            });
            console.log(allCommits);
            var template = $('#gitReposTemplate').html()
            var compiledTemplate = _.template(template);
            var templateMarkup = compiledTemplate({commits: allCommits});
            $('#gitReposTemplateContent').html(templateMarkup);
        });
    });
});