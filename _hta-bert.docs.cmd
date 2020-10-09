@echo OFF
pushd %~dp0..\x64

:top
REM set "PATH=C:\Program Files (x86)\Google\Chrome\Application;C:\wintools\PortableApps\node-v12.16.0-win-x86;C:\wintools\PortableApps\node-v12.16.0-win-x86\node_modules\chromedriver\lib\chromedriver;%PATH%"
REM set "PATH=S:\wintools\PortableApps\chrome-win;%~dp0node-v12.16.0-win-x86;%~dp0node-v12.16.0-win-x86\node_modules\chromedriver\lib\chromedriver;%PATH%"

REM set nodeRoot=node-v12.16.3-win-x64
REM set nodeRoot=node-v12.16.0-win-x86

call :detect_arch
call :nodeLoad
call :driversLoad
call :browserAutodetect
goto :end


:nodeLoad
IF DEFINED VERBOSE echo VERBOSE: %HIGH%%b%%~n0 %~0 %c%%*%END% 1>&2
:: cannot use %~dp0 with Bat_To_Exe_Converter as the exe get exploded under %APPDATA%
:: set "PATH=%~dp0%nodeRoot%;%PATH%"

:: set nodeRoot=node-v12.16.3-win-x64
:: set nodeRoot=node-v12.16.0-win-x86

for /F %%d in ('dir /b /ad /od "%CD%\node-*" 2^>NUL') DO set nodeRoot=%%d

REM call :update_PATH %~dpn0\%bitx%\%nodeRoot%      // done by nodevars.bat
set NODE_PATH=%CD%\node_modules
IF DEFINED VERBOSE (call %CD%\%nodeRoot%\nodevars.bat) ELSE call %CD%\%nodeRoot%\nodevars.bat >NUL
goto :EOF


:driversLoad
IF DEFINED VERBOSE echo VERBOSE: %HIGH%%b%%~n0 %~0 %c%%*%END% 1>&2
for %%p in ("%NODE_PATH%\chromedriver\lib\chromedriver" "%NODE_PATH%\geckodriver" "%NODE_PATH%\iedriver\lib\iedriver%bitsLess%") DO (
  IF EXIST "%%~p\" call :update_PATH "%%~p"
)
goto :EOF


:browserAutodetect
:: browsers:
for %%b in (IEXPLORE firefox) DO (
  IF DEFINED VERBOSE echo   Checking %%b...
  REM :: get the default key from registry = full path the each installed browser.exe
  IF DEFINED DEBUG reg query "HKLM\Software\Microsoft\Windows\CurrentVersion\App Paths\%%b.exe" /ve
  for /f "tokens=3,*" %%P in ('reg query "HKLM\Software\Microsoft\Windows\CurrentVersion\App Paths\%%b.exe" /ve 2^>NUL') DO (
    IF EXIST "%%P %%Q" (
      echo            %%b found: %%P %%Q
      IF DEFINED DEBUG echo set %%b_BIN=%%P %%Q
      set "%%b_BIN=%%P %%Q"
      call :update_PATH "%%P %%~dpQ"
    )
  )
)

REM set chromiumRelease=win64-737027
REM set chromiumRelease=win32-737027
for /F %%d in ('dir /b /ad /od %NODE_PATH%\puppeteer\.local-chromium\win* 2^>NUL') DO set chromiumRelease=%%d

REM :: CHROME_BIN for karma
IF EXIST %NODE_PATH%\puppeteer\.local-chromium\%chromiumRelease%\chrome-win\chrome.exe (
  IF /I "chrome"=="%browserNameParam%" set browserNameFound=True
  set "PATH=%NODE_PATH%\puppeteer\.local-chromium\%chromiumRelease%\chrome-win;%PATH%"
  set CHROME_BIN=%NODE_PATH%\puppeteer\.local-chromium\%chromiumRelease%\chrome-win\chrome.exe
)
goto :EOF


:update_PATH addon [after]
echo %PATH% | findstr /I /C:"%~1" >NUL && exit /b 0
IF /I "%~2"=="" set "PATH=%~1;%PATH%"
IF /I "%~2"=="after" set "PATH=%PATH%;%~1"
goto :EOF


:detect_arch
IF DEFINED DEBUG echo DEBUG: %m%%~n0 %~0 %HIGH%%*%END% 1>&2
IF DEFINED bits exit /b 0
set bitsLess=
set bits=32
set bitx=x86
set arch=-x86
IF DEFINED PROCESSOR_ARCHITEW6432 (
  echo WARNING: running 32bit cmd on 64bit system 1>&2
  set PROCESSOR_ARCHITECTURE=AMD64
)
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
  set bitsLess=64
  set bits=64
  set bitx=x64
  set arch=-x64
)
goto :EOF


:end
cd ..
set base=https://c-lms.com/license/enduser/portal/LAInput.jsp
set MEAPS=%CD%\MEAPS.csv
set folderCE=%CD%\Embedded-for-Canon_5.1.3.1-US
set filename=%folderCE%\Guest Print 5.1.2.30.lic
set licenseNumber=ES3B-2DXJ-X8CE-9WAZ

echo set base=%base%
echo set MEAPS=%MEAPS%
echo set folderCE=%folderCE%
echo set filename=%filename%
echo set licenseNumber=%licenseNumber%
echo.

REM call nodevars

:: force a browser:
REM set browserName=iexplore
REM set browserName=firefox
set browserName=chrome

pushd %~dp0
start "" /MIN http-server --silent --port 80 -o
