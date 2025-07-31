#!/bin/bash

# -- Update these variables --
SFTP_USER="alexf377886.aa437702"
SFTP_HOST="sftp://gamesams85.bisecthosting.com:2022"
SFTP_PORT=22
REMOTE_PATH="/home/container/garrysmod/data/player_logins.txt"
LOCAL_PATH="player_logins.txt"

scp -P $SFTP_PORT $SFTP_USER@$SFTP_HOST:$REMOTE_PATH $LOCAL_PATH
