@echo off
@title BadassBoard installation
cls

echo.
echo Welcome to the BadassBoard installer !
echo.
echo Checking if Node.js is already installed...

if exist "C:\Program Files\nodejs\node.exe" (
  echo Node.js is already installed, moving on...
  goto unzip
) else (
  if not exist "%cd%\node-installer.msi" (
    echo Downloading Node.js...
    powershell -command "(Invoke-WebRequest 'https://nodejs.org/dist/v14.3.0/node-v14.3.0-x86.msi' -OutFile '%cd%\node-installer.msi')"
  ) else (
    echo The Node.js installer was already downloaded.
    echo Starting Node.js installation...
  )

  msiexec /i %cd%\node-installer.msi /qn
)

:unzip
if not exist "C:\Users\%username%\Documents\BadassBoard" (
  mkdir "C:\Users\%username%\Documents\BadassBoard"
)

if not exist "%cd%\BadassBoard.zip" (
  powershell -command "(Invoke-WebRequest 'https://api.github.com/repos/belgianGeek/BadassBoard/zipball/0.3.0' -OutFile '%cd%\BadassBoard.zip')"
  echo.
  echo BadassBoard files have been successfully downloaded !
) else (
  echo.
  echo BadassBoard files were already downloaded, unzipping...
)

echo.
echo  Getting Powershell unzip module...
powershell -command "(Get-Command -Module Microsoft.PowerShell.Archive)"
powershell -command "(Expand-Archive -Path %cd%\BadassBoard.zip -DestinationPath C:\Users\%username%\Documents\BadassBoard -Verbose)"

echo.
echo Installing dependencies...
cd C:\Users\%username%\Documents\BadassBoard\
start /b /wait npm i -g yarn
timeout /t 5 /nobreak > nul
start /b /wait yarn install
goto end

:end
echo.
echo All done ! Starting app...
start /b /wait node app.js
