#!/bin/bash

# -- Update these variables --
SFTP_USER="your_bisect_username"
SFTP_HOST="your.bisect.server.ip"
SFTP_PORT=22
REMOTE_PATH="/home/container/garrysmod/data/player_logins.txt"
LOCAL_PATH="/path/to/dashboard/player_logins.txt"

scp -P $SFTP_PORT $SFTP_USER@$SFTP_HOST:$REMOTE_PATH $LOCAL_PATH