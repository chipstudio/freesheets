#!/bin/bash
npm install

## EMPTY PROOF FOLDER
rm -Rf proof/*

## copy everything to proof
cp -Rf source/* proof/

## dash each file into its original name
for f in proof/*.html;
do node -e "`curl -sS https://tryda.sh`" $f ${f/.*/.html} "proof/"
done

## POPULATE PROOF FOLDER
rm -Rf proof/library
mv source backup
mv proof source