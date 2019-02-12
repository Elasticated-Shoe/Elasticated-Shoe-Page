function getFormattedDate(date) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    var hour = date.getHours();
    hour = hour > 9 ? hour : '0' + hour;
    var minute = date.getMinutes();
    minute = minute > 9 ? minute : '0' + minute;
    return year + '/' + month + '/' + day + " - " + hour + ":" + minute;
}
$(document).ready(function(){
  // check if there is a cache present, and that it is not older than threshold
  var commitsCacheTime = localStorage.getItem("commitHistroyGetTime");
  // cache old, refresh
  if(Date.now() - commitsCacheTime > 600000) {
    console.log("Regenerating Cache");
    $.get("https://api.github.com/users/Elasticated-Shoe/repos", function(gitData) {
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
        allCommits.sort(function(a,b){return Date.parse(a["commit"]["author"]["date"]) - Date.parse(b["commit"]["author"]["date"])});
        allCommits = allCommits.reverse();
        for(commit in allCommits) {
          allCommits[commit]["repoName"] = allCommits[commit]["url"].split("/")[5];
          allCommits[commit]["commit"]["author"]["date"] = getFormattedDate(allCommits[commit]["commit"]["author"]["date"]);
        }
        // store data in local storage as cache
        localStorage.setItem("commitHistroy", JSON.stringify(allCommits));
        localStorage.setItem("commitHistroyGetTime", Date.now());
        var template = $('#gitReposTemplate').html()
        var compiledTemplate = _.template(template);
        var templateMarkup = compiledTemplate({commits: allCommits});
        $('#gitReposTemplateContent').html(templateMarkup);
      });
    });
  }
  else {
    console.log("Using Cache");
    var commitsCache = JSON.parse(localStorage.getItem("commitHistroy"));
    var template = $('#gitReposTemplate').html()
    var compiledTemplate = _.template(template);
    var templateMarkup = compiledTemplate({commits: commitsCache});
    $('#gitReposTemplateContent').html(templateMarkup);
  }
});