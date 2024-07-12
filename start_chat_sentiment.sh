#!/bin/bash
source ~/.zshrc
conda activate gruppo_twitch
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR/server"
python chat_server.py