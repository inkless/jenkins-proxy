#!/bin/bash

echo "creating cache folder..."
mkdir -p cache
echo "fetching slack user data..."
node cron_jobs/fetch_user.js

echo "creating sqlite database..."
mkdir -p db
touch db/data.db

echo "executing sqls..."
for i in $( ls sql ); do
  sqlite3 db/data.db < sql/${i}
done

echo "init completed!"
