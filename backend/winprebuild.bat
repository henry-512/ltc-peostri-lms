@echo off

mkdir %CD%\build
COPY  %CD%\.env %CD%\build\.env && mkdir %CD%\src\lms
xcopy /s/y %CD%\..\lms\ %CD%\src\lms\
