import os # file system interaction
import subprocess # run command
from bs4 import BeautifulSoup # parses html

directory = r"_site"

# iterate over all files in all directories inside out directory
for dirBase, directories, allFiles in os.walk(directory):
    for fileName in allFiles:
        tempFullPath = os.path.join(dirBase, fileName)
        if fileName.endswith(".css"):
            openCommandHandle = subprocess.Popen("uglifycss " + tempFullPath, stdout=subprocess.PIPE, shell=True)
            output, err = openCommandHandle.communicate()
            fileToEdit = open(tempFullPath, "w", encoding="utf-8")
            fileToEdit.write(output.decode("utf-8"))
        elif fileName.endswith(".js"):
            openCommandHandle = subprocess.Popen("uglifyjs " + tempFullPath, stdout=subprocess.PIPE, shell=True)
            output, err = openCommandHandle.communicate()
            fileToEdit = open(tempFullPath, "w", encoding="utf-8")
            fileToEdit.write(output.decode("utf-8"))
        elif fileName.endswith(".png") or fileName.endswith(".jpg"): # no image op
            pass
        elif fileName.endswith(".html"):
            os.system("html-minifier --collapse-whitespace --output " + tempFullPath + " " + tempFullPath)