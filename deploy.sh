#!/bin/bash

# stop app
/root/.nvm/versions/node/v16.13.2/bin/pm2 stop receptia

# stash anything
git stash

# checkout release
git checkout release

# pull release
git pull release

# restart app
/root/.nvm/versions/node/v16.13.2/bin/pm2 restart receptia