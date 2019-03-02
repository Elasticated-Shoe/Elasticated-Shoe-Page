import os

def createFileTypeIndexedDict(directory):
    fileDict = {}
    for directoryBase, dirs, allFiles in os.walk(directory):
        for fileName in allFiles:
            fileType = fileName.split(".")[-1]
            if fileType not in fileDict:
                fileDict[fileType] = []
            fullFilePath = os.path.join(directoryBase, fileName)
            fileNameNoFormat = fileName.replace("." + fileType, "")
            fileDict[fileType].append({
                "Name": fileNameNoFormat,
                "Path": fullFilePath
            })
    return fileDict

def writeToFile(pathToFile, fileContent):
    tempFile = open(pathToFile, "w", encoding="utf-8")
    tempFile.write(fileContent)

def appendToFile(pathToFile, fileContent):
    tempFile = open(pathToFile, "a", encoding="utf-8")
    tempFile.write(fileContent)

def readFromFile(pathToFile):
    f = open(pathToFile, "r", encoding="utf-8")
    return f.read()

def deleteFile(pathToFile):
    try:
        os.remove(pathToFile)
    except FileNotFoundError:
        pass

def joinPath(filePathList):
    filePathList.insert(0, os.path.dirname( __file__ ))
    return os.path.abspath(os.path.join(*filePathList))
