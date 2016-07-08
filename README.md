Jenkins Proxy
=============

### Prerequisite
Requires `node` and `npm` installed. The minimum version of `node` is `4.4.5`.

It's also recommended to use the latest node.

```bash
apt-get install nodejs
```

### Usage
##### 1. Copy the `.env-sample` to `.env`

```bash
cp .env-sample .env
```

##### 2. Add your own authentication in `.env`

  You can get those auth token from slack and jenkins

##### 3. Add a cron jobs in your crontab

```bash
crontab -e
```

You might add something like this:

```
0 0 * * * cd path_to_this_dir && node cron-jobs/fetch_user.js
```

##### 4. Init the app

```bash
./init.sh
```

This will create database, fetch cache, etc for you.

##### 5. Start your app
It's recommended to use `forever` to start your app

```bash
npm install -g forever
```

Then you can do:

```bash
forever start index.js
```
