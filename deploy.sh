#!/bin/bash

# stop app
/root/.nvm/versions/node/v16.13.2/bin/pm2 stop receptia

# checkout release (wtf how hard..)
git fetch && git reset --hard origin/release

# restart app
/root/.nvm/versions/node/v16.13.2/bin/pm2 restart receptia