import os # used to recursively get files from our directory
from bs4 import BeautifulSoup # parses html
from bs4.element import Comment # for filtering html comments
import json

directory = r"_site"
resultsDictionary = []

def pageTextFilter(element):
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if element.parent.find_all('div', class_= ["fill-container", "tile-overlay", "tile-overlay-solid"]):
        return False
    if isinstance(element, Comment):
        return False
    return True


def getPageText(soup):
    texts = soup.findAll(text=True)
    visible_texts = filter(pageTextFilter, texts)  
    return u" ".join(t.strip() for t in visible_texts)

# iterate over all files in all directories inside out directory
for dirBase, directories, allFiles in os.walk(directory):
    for fileName in allFiles:
        # only get the full path of the .html files
        if fileName.endswith(".html") and fileName != "404.html":
            tempDictionary = {}
            tempFullPath = os.path.join(dirBase, fileName)
            # read the contents of our file
            with open(tempFullPath, encoding="utf8") as unparsedFileContent:
                try:
                    parsedFileContent = BeautifulSoup(unparsedFileContent, features="html.parser")
                except UnicodeDecodeError as e:
                    print(e)
                    continue
            pageContentDIV = parsedFileContent.find("div", {"id": "content-container"})
            
            if pageContentDIV == None:
                continue
            for section in pageContentDIV.find_all("div", {'data-template':'content_types/tiles.html'}): 
                section.decompose()
            for section in pageContentDIV.find_all("div", {'data-template':'content_types/heading.html'}): 
                section.decompose()
            for section in pageContentDIV.find_all("div", {'data-template':'content_types/images.html'}): 
                section.decompose()
            for section in pageContentDIV.find_all("div", {'data-template':'content_types/slides.html'}): 
                section.decompose()
            
            tempDictionary["title"] = parsedFileContent.find('title').string
            tempDictionary["url"] = parsedFileContent.body["data-url"]
            for div in pageContentDIV.find_all("div"):
                try:
                    tempKey = div["data-template"].replace(r"content_types/", "")
                    tempKey = tempKey.replace(".html", "")
                    if tempKey in tempDictionary:
                        tempDictionary[tempKey] += getPageText(div)
                    else:
                        tempDictionary[tempKey] = {}
                        tempDictionary[tempKey] = getPageText(div)
                except KeyError as e:
                    continue
            resultsDictionary.append(tempDictionary)

with open('assets/searchIndex.json', 'w') as outfile:
    json.dump(resultsDictionary, outfile)