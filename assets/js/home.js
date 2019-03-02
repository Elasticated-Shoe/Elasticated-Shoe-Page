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

function generateTable(data) {
  var template = $('#gitReposTemplate').html()
  var compiledTemplate = _.template(template);
  var templateMarkup = compiledTemplate({commits: data});
  $('#gitReposTemplateContent').html(templateMarkup);
  $('#gitCommitsTable').DataTable({
    "order": [[ 0, "desc" ]]
  });
}

function getGraphData(data) {
  data = data.reverse();
  var xValues = [];
  var yValues = [];
  var commitData = {};
  for(commit in data) {
    var tempDate = new Date(data[commit]["timestamp"]).getTime();
    tempDate = Math.floor(tempDate / 86400000) * 86400000;
    if(!(tempDate in commitData)) {
      commitData[tempDate] = [];
    }
    commitData[tempDate].push("1");
  }
  for(commitDate in commitData) {
    xValues.push(new Date(parseInt(commitDate)).toISOString());
    yValues.push(commitData[commitDate].length);
  }
  var commitFreqOrdered = yValues.slice();
  commitFreqOrdered.sort(function sortNumber(a,b) {return b - a;});
  var graph = [{
      x: xValues,
      y: yValues,
      type: 'bar'
  }];
  var layout = {
    yaxis: {
      range: [0, commitFreqOrdered[0] + 2],
    }
  };
  $('#gitReposGraphContent').html("");
  Plotly.newPlot('gitReposGraphContent', graph, layout);
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
    // check if there is a cache present, and that it is not older than threshold
    var commitsCacheTime = localStorage.getItem("commitHistroyGetTime");
    // if cache old, refresh
    if(Date.now() - commitsCacheTime > 600000) {
      console.log("Regenerating Cache");
      $.get("https://api.github.com/users/Elasticated-Shoe/repos", function(gitData) {
        var allCommits = []
        var promises = [];
        // create promises for each repo
        for(repo in gitData) {
            var repoCommits = gitData[repo]["commits_url"].replace("{/sha}", "")
            var promise = $.get(repoCommits, function(commitData) {
                for(commit in commitData) {
                    allCommits.push(commitData[commit]);
                }
            });
          promises.push(promise);
        }
        // this way waits until all promises are executed before executing callback, we can be certain all the data will be available
        Promise.all(promises).then(function() {
          commitCacheArray = [];
          allCommits.sort(function(a,b){return Date.parse(a["commit"]["author"]["date"]) - Date.parse(b["commit"]["author"]["date"])});
          allCommits = allCommits.reverse();
          // take values needed into commitCacheArray, so we only store what is needed
          for(commit in allCommits) {
            commitCacheArray.push({
              "repo": allCommits[commit]["url"].split("/")[5],
              "timestamp": Date.parse(allCommits[commit]["commit"]["author"]["date"]),
              "date": getFormattedDate(allCommits[commit]["commit"]["author"]["date"]),
              "comment": allCommits[commit]["commit"]["message"]
            });
          }
          // store data in local storage as cache
          localStorage.setItem("commitHistroy", JSON.stringify(commitCacheArray));
          localStorage.setItem("commitHistroyGetTime", Date.now());
          // generate table
          generateTable(commitCacheArray);
          // generate graph
          getGraphData(commitCacheArray);
          $("#mobileMessage").html("Using GIT API");
        });
      });
    }
    else {
      console.log("Using Cache");
      var commitsCache = JSON.parse(localStorage.getItem("commitHistroy"));
      $("#mobileMessage").html("Using GIT Cache");
      // generate table
      generateTable(commitsCache);
      // generate graph
      getGraphData(commitsCache);
    }
  });
});