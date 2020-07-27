var graphIt = (function() {

    // Public Members

    // Private Methods

    // Public Methods
    function generateTable(data) {
        var deepClonedData = JSON.parse( JSON.stringify( data ) );
        deepClonedData.sort(function(a,b){return Date.parse(a["commit"]["author"]["date"]) - Date.parse(b["commit"]["author"]["date"])});
        deepClonedData = deepClonedData.reverse();
    
        var template = $('#gitReposTemplate').html()
        var compiledTemplate = _.template(template);
        var templateMarkup = compiledTemplate({commits: deepClonedData});
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
            var tempDate = new Date(data[commit]["commit"]["author"]["date"]).getTime();
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
    // Public members/methods exposed in return statement
    return {
        Table: generateTable,
        Bar: getGraphData
    };
})();