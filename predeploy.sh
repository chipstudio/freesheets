#!/bin/bash

## install jsdom + request
npm install

## empty compiled folder
rm -Rf compiled/*

## copy all of the source folder to compiled
cp -Rf source/* compiled/

## dashify each html file in the compiled folder
for f in compiled/*.html;
do node -e "`curl -sS https://tryda.sh`" $f ${f/.*/.html} "compiled/"
done

## remove the dash library from the compiled folder
rm -Rf compiled/library

## rename our source directory to 'backup'
mv source backup

## rename our compiled directory to 'source' for deploy
mv compiled source