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
        $(document).foundation() // initialize foundation framework

        $('.slide-container').slick({
            // initialize any slick slideshows on the page
            dots: true,
            infinite: true,
            vertical: false,
            speed: 500,
            slidesToShow: 1,
            adaptiveHeight: false,
            arrows: true
        });
        // performs fuzzy search when search button clicked or when you press enter
        // only does this after fetching the json file
        $.get("/Elasticated-Shoe-Page/assets/searchIndex.json", function(searchData) {
            // button click
            $(".searchInput + button").click(function() {
                search = $(".searchInput").val();
                if(search === "") {
                    return false;
                }
                performSearch(searchData, search)
            });
        });
        // show alphabatised results
        $.get("/Elasticated-Shoe-Page/assets/alphabatisedIndex.json", function(alphabatisedData) {
            // passes clicked letter to search
            $(".alphabettiSpaghetti div ul li").click(function () {
                var letterKey = $(this).text();
                $('#searchContents').html("");
                if (!(letterKey in alphabatisedData)) {
                    $("#searchContents").append("<div class='small-12'><p>No Pages Starting With " + letterKey + "</p></div>");
                }
                else {
                    $("#searchContents").append("<div class='small-12'><p>Showing Pages Starting With " + letterKey + "</p></div>");
                }
                for(result in alphabatisedData[letterKey]) {
                    var url = alphabatisedData[letterKey][result]["URL"];
                    var title = alphabatisedData[letterKey][result]["Title"]
                    $("#searchContents").append("<div class='small-12'><a href='" + url + "'<p>" + title + "</p></a></div>");
                }
                $("#searchModal").foundation('open');
            });
        });
        function performSearch(searchData, search, keys) {
            // set the options for fuseJS
            var options = {
                shouldSort: true,
                findAllMatches: true,
                includeMatches: true,
                threshold: 0.4,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: search.length,
                keys: keys
            }
            // Do search and get results. Results returned as JSON
            var fuse = new Fuse(searchData, options);
            var fuseResults = fuse.search(search);
            $('#searchContents').html("");
            // if no results
            if(fuseResults.length === 0) {
                $("#searchContents").append("<div class='small-12'>No Results Found For " + search + "</div>")
            }
            // iterate over each result
            for(result in fuseResults) {
                // get the url and title of the page
                var url = fuseResults[result]["item"]['url'];
                var text = fuseResults[result]["item"]['title'];
                // iterate over the first match of all the mathches
                for(match in fuseResults[result]["matches"]) {
                    var startMatch = fuseResults[result]["matches"][match]["indices"][0][0];
                    var endMatch = fuseResults[result]["matches"][match]["indices"][0][1];
                    var matchKey = fuseResults[result]["matches"][match]["key"];
                    var startElipses = "";
                    var endElipses = "";
                    if(startMatch - 60 < 0) {
                        startMatch = 0;
                    }
                    else {
                        startMatch = startMatch - 60;
                        startElipses = "..."
                    }
                    if(endMatch + 60 >= fuseResults[result]["item"][matchKey].length) {
                        endMatch = fuseResults[result]["item"][matchKey].length;
                    }
                    else {
                        endMatch = endMatch + 60;
                        endElipses = "..."
                    }
                    // cut the string around the result to provide an excerp (some context for the user)
                    var matchExcerp = fuseResults[result]["item"][matchKey].substr(startMatch, endMatch)
                    break;
                }
                // append result to searchContents div
                $("#searchContents").append("<div class='small-12'><a href='" + url + "'<p>" + text + "</p></a></div>");
                $("#searchContents").append("<div class='small-12'><p>" + startElipses + matchExcerp + endElipses +"</p></div>");
            }
            // show the foundation modal (overlays over page)
            $("#searchModal").foundation('open');
        }
    });
});
