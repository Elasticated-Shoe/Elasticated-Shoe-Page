from bs4 import BeautifulSoup # parses html
from bs4.element import Comment # for filtering html comments

def parseFile(file):
    with open(file, encoding="utf8") as unparsedFileContent:
        try:
            parsedFileContent = BeautifulSoup(unparsedFileContent, features="html.parser")
        except UnicodeDecodeError as e:
            return False
    return parsedFileContent

def removeTemplateFromSoup(soup, template):
    for section in soup.find_all("div", {'data-template':'content_types/' + template + '.html'}): 
        section.decompose()
    return soup

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

def getPageTitle(soup):
    return soup.find('title').string

def getPageUrl(soup):
    return soup.body["data-url"]
    