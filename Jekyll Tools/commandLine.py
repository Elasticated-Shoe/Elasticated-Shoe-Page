import subprocess

def runCommand(command):
    openCommandHandle = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
    output, err = openCommandHandle.communicate()
    return output