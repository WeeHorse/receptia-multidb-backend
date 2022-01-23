#!/bin/bash

# stop app
pm2 stop receptia

# stash anything
git stash

# checkout release
git checkout release

# pull release
git pull release

# restart app
pm2 restart receptia