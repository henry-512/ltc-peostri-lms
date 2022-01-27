@echo off

mkdir %CD%\build
COPY  %CD%\%CD%env %CD%\build\%CD%env && mkdir %CD%\src\lms
COPY  %CD%.\lms\types.tsx %CD%\src\lms\types.ts
