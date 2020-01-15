#!/bin/bash

## HTML: page.backup.html > page.html
for f in source/*.html; 
do mv $f ${f/.*/.html}; 
done

## remove backup files
for f in proof/*.backup.html; 
do rm $f;
done