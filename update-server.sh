# kill previous server instances
p=$(ps -C node -o pid --no-headers)
kill $p
git pull
rm nohup.out
nohup node server/app.js &
