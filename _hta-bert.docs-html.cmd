<!-- :
:: https://github.com/berttejeda/bert.docs#example1-build-an-hta-application-from-a-markdown-file
@echo off

call :detect_arch
call :update_PATH "%~dp0..\bin"
call :update_PATH "%~dp0..\bin\%bitx%"

:: https://github.com/npocmaka/batch.scripts/tree/master/hybrids/mshta/ui.extensions
REM pushd %~dp0hta-bert.docs-master
pushd %~dp0
for /f "tokens=* delims=" %%p in ('mshta.exe "%CD%\index.html"') do (
    set "pass=%%p"
)
echo your password is %pass%
timeout /t 2 >NUL
exit /b

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
