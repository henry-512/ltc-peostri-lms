@echo off

mkdir %CD%\build
COPY  %CD%\.env %CD%\build\.env && mkdir %CD%\src\lms
COPY  %CD%\\..\lms\types.tsx %CD%\src\lms\types.ts
