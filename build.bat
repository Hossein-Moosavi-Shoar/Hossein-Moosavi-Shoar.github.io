@echo off
set PATH=C:\Ruby33\bin;C:\msys64\ucrt64\bin;%PATH%
set MAKE=C:\Ruby33\bin\makew.bat
set JEKYLL_ENV=production
cd /d G:\apply\al-folio
call C:\Ruby33\bin\bundle.bat exec jekyll build
