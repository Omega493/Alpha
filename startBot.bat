@echo off
echo Installing missing dependencies...
node installMissingDeps.js

echo Deleting global commands...
node deleteGlobalCommands.js

echo Deleting guild-specific commands...
node deleteGuildSpecificCommands.js

echo Starting the bot...
node index.js

pause
