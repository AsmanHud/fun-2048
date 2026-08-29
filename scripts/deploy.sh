#!/usr/bin/env bash
set -euo pipefail

branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" != "main" ]; then
	echo "Refusing to deploy: on branch '$branch', not 'main'." >&2
	exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
	echo "Refusing to deploy: working tree has uncommitted changes." >&2
	exit 1
fi

git fetch origin main --quiet

local_sha=$(git rev-parse main)
remote_sha=$(git rev-parse origin/main)
if [ "$local_sha" != "$remote_sha" ]; then
	echo "Refusing to deploy: local main ($local_sha) is not in sync with origin/main ($remote_sha)." >&2
	exit 1
fi

npm run build
butler push dist asmanhud/fun-2048:web
