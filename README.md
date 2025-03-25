
### Features

- Uses Node.js and discord.js
- Has essential moderation commands, like `/ban`, `/unban`, `/kick`
- Has a logging system to log moderator actions
- Has other commands, such as `/avatar`, `/ping`

# Alpha - a Discord bot

## Overview
Alpha is a Discord moderation bot created using Javascript. It uses Node.js and the module discord.js.

## Commands
 ### Moderation Commands
 - `/ban` - Bans a member from the server. Uses the UserID of the target member.
 - `/unban` - Unbans a member from the server. Uses the UserID of the target member.
 - `/hardmute` - Mutes a member and removes all their roles. Has the mandatory fields `target` (the targeted user) and `time` (mute duration in minutes). Has a `reason` field (reason for the mute, defaults to `No reason provided`. 
 - `/kick` - Kicks a member from the server. Has a mandatory field `target` (the targeted user). Has a `reason` field (reason for the kick, defaults to `No reason provided`. 
 - `/massban` - Bans multiple members from the server. Has a mandatory fields `users` (the targeted users), accepts UserIDs, separated by commas. Has a `reason` field (reason for the ban, defaults to `No reason provided`. 
