#!/usr/bin/env bash
set -euo pipefail

project_dir="/home/renato/Projetos/Renato/nba-dashboard"
cd "$project_dir"

/home/renato/venv-nba/bin/python update_data.py
