$user = $env:UserName
Set-Location -Path C:\Users\$user\Downloads
$location = Get-Location

echo Welcome to the BadassBoard installer !
echo Checking if Node.js is already installed...

$nodeInstalled = Test-Path "C:\Program Files\nodejs\node.exe" -PathType Any
if ($nodeInstalled) {
  echo Node.js is already installed, moving on...
} else {
  $installerDownloaded = Test-Path "$location\node-installer.msi" -PathType Any
  if (!$installerDownloaded) {
    echo Nodejs is not installed, downloading...
    Invoke-WebRequest 'https://nodejs.org/dist/v14.3.0/node-v14.3.0-x86.msi' -OutFile "$location\node-installer.msi"
  } else {
    echo The Node.js installer was already downloaded.
  }

  echo Starting Node.js installation...
  msiexec /i node-installer.msi /qn
}

$BadassFolder = Test-Path "C:\Users\$user\Documents\BadassBoard" -PathType Any
if (!$BadassFolder) {
  mkdir "C:\Users\$user\Documents\BadassBoard"
}

$BadassZip = Test-Path "$location\BadassBoard.zip" -PathType Any
if (!$BadassZip) {
  Invoke-WebRequest 'https://api.github.com/repos/belgianGeek/BadassBoard/zipball/0.3.0' -OutFile "$location\BadassBoard.zip"
  echo BadassBoard files have been successfully downloaded !
} else {
  echo BadassBoard files were already downloaded, unzipping...
}

echo  Getting Powershell unzip module...
Get-Command -Module Microsoft.PowerShell.Archive
[Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem')
Expand-Archive -Path $location\BadassBoard.zip -DestinationPath C:\Users\$user\Documents\BadassBoard -Force
$zipFolder = [io.compression.zipfile]::OpenRead("$location\BadassBoard.zip").Entries[0].FullName
Copy-Item -Path C:\Users\$user\Documents\BadassBoard\$zipFolder\* -Destination C:\Users\$user\Documents\BadassBoard -Force

echo Installing dependencies...
npm i -g yarn
yarn install

echo Cleaning up...

$installerDownloaded = Test-Path "$location\node-installer.msi" -PathType Any
if ($installerDownloaded) {
  Remove-Item $location\node-installer.msi
}

cd C:\Users\$user\Documents\BadassBoard
echo $location
$BadassFolder = Test-Path "$location\$zipFolder" -PathType Any
if ($BadassFolder) {
  Remove-Item $zipFolder -Recurse
}

$BadassZip = Test-Path "$location\BadassBoard.zip" -PathType Any
if ($BadassZip) {
  Remove-Item $location\BadassBoard.zip
}

echo All done ! Starting app...
node app.js
