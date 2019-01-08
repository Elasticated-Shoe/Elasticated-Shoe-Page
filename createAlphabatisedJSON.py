import os # used to recursively get files from our directory
from bs4 import BeautifulSoup # parses html
from bs4.element import Comment # for filtering html comments
import json

directory = r"_site"
resultsDictionary = {}

# iterate over all files in all directories inside out directory
for dirBase, directories, allFiles in os.walk(directory):
    for fileName in allFiles:
        # only get the full path of the .html files
        if fileName.endswith(".html") and fileName != "404.html":
            tempFullPath = os.path.join(dirBase, fileName)
            # read the contents of our file
            with open(tempFullPath, encoding="utf8") as unparsedFileContent:
                try:
                    parsedFileContent = BeautifulSoup(unparsedFileContent, features="html.parser")
                except UnicodeDecodeError as e:
                    print(e)
                    continue
            pageTitle = parsedFileContent.find('title').string
            pageURL = parsedFileContent.body["data-url"]
            if pageTitle[0].upper() not in resultsDictionary:
                resultsDictionary[pageTitle[0].upper()] = []
            resultsDictionary[pageTitle[0].upper()].append({"URL": pageURL,
                                                            "Title": pageTitle})


with open('assets/alphabatisedIndex.json', 'w') as outfile:
    json.dump(resultsDictionary, outfile)