#!/bin/bash

## EMPTY PROOF FOLDER
rm -Rf proof/*

## DASH FILES
## make a copy of each html file to page.backup.html
for f in source/*.html; 
do cp $f ${f/.*/.backup.html};
done

## dash each backup file into its original name
for f in source/*.backup.html;
do node -e "`curl -sS https://tryda.sh`" $f ${f/.*/.html} "source/"
done

## POPULATE PROOF FOLDER
cp -Rf source/* proof/
rm -Rf proof/