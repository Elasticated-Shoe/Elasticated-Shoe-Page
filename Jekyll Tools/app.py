import beautifulSoup
import fileSystem
import commandLine

allAssets = fileSystem.createFileTypeIndexedDict(fileSystem.joinPath(["..", "assets"]))
allIncludes = fileSystem.createFileTypeIndexedDict(fileSystem.joinPath(["..", "_includes"]))
allLayouts = fileSystem.createFileTypeIndexedDict(fileSystem.joinPath(["..", "_layouts"]))
jsBundleFile = fileSystem.joinPath(["..", "assets", "js", "vendor", "bundle.js"])
cssBundleFile = fileSystem.joinPath(["..", "assets", "css", "bundle.css"])
TempFilePath = fileSystem.joinPath(["..", "assets", "tempfile.txt"])

def generateVendorBundle(bundleFileType, bundleFilePath, mode):
    fileSystem.writeToFile(bundleFilePath, "")
    for i in range(len(allAssets[bundleFileType])):
        filePath = allAssets[bundleFileType][i]["Path"]
        if ("vendor" not in filePath and "css" not in filePath) or "bundle" in filePath or "tempfile" in filePath:
                continue
        commandLine.runCommand(mode + ' "' + filePath + '"' + " --output " + '"' + TempFilePath + '"')
        fileSystem.appendToFile(bundleFilePath, fileSystem.readFromFile(TempFilePath))
    fileSystem.deleteFile(TempFilePath)

def minifyTemplate(data):
    for i in range(len(data)):
        commandLine.runCommand('html-minifier --collapse-whitespace --output "' + data[i]["Path"].replace(".html", "Min.html") + '" "' + data[i]["Path"] + '"')

generateVendorBundle("js", jsBundleFile, "uglifyjs")
generateVendorBundle("css", cssBundleFile, "uglifycss")

#minifyTemplate(allIncludes["html"])

commandLine.runCommand("jekyll build -s '" + fileSystem.joinPath([".."]) + "' -d '" + fileSystem.joinPath(["..", "_site"]) + "'")