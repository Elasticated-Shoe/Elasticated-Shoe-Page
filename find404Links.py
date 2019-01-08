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
                    pageContentDIV = parsedFileContent.find("div", {"id": "content-container"})
                except UnicodeDecodeError as e:
                    print(e)
                    continue
            if pageContentDIV == None:
                continue
            for link in pageContentDIV.find_all("a"):
                try:
                    if "404.html" in link["href"]:
                        print(parsedFileContent.body["data-url"])
                        break
                except KeyError as e:
                    pass