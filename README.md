## kobo2geojson

API for taking data from a survey on KoBo and serving is as a publicly available GeoJSON.

### Development

- install PostgreSQL (10) and PostGIS (2.4), on OSX you can do this easily with https://postgresapp.com
- install Node.js (10.15.2)
  - suggested to install [nvm](https://github.com/creationix/nvm)
  - and run `nvm install 10.15.2` and `nvm use`
- `npm install` to install node module dependencies
- `node ./setup/dbSetup.js` to initialize database
- `node server.js` to start the app

### Production

- tested on Amazon Web Services (AWS) EC2 
  - Ubuntu Server 18.04 LTS (HVM), SSD Volume Type - ami-005bdb005fb00e791 (64-bit x86)
  - t2.micro
  - 16 GB storage
  - security rule opening up HTTP port 80
- install PostgreSQL (10) and PostGIS (2.4)
```
# http://trac.osgeo.org/postgis/wiki/UsersWikiPostGIS24UbuntuPGSQL10Apt
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt bionic-pgdg main" >> /etc/apt/sources.list'
wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-10
sudo apt install postgresql-10-postgis-2.4 
sudo apt install postgresql-10-postgis-scripts
sudo -u postgres createuser --superuser -P ubuntu
# enter password and remember it to add to `./config.js`
sudo service postgresql start
sudo -u postgres createdb -O ubuntu assessment
# `assessment` in final step should match whatever you set in `config.js` for `config.pg.database`
```
- install Node.js (10.15.2), suggested to use [nvm](https://github.com/creationix/nvm)
```
# https://github.com/creationix/nvm#install--update-script
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
logout
# log back in
command -v nvm
# should log "nvm" if successfully installed
nvm install 10.15.2
```
- clone the repository `git clone https://github.com/AmericanRedCross/kobo2geojson.git`
- change directory into the project folder `cd kobo2geojson`
- `nvm use`
- `npm install` to install node module dependencies
- `vim config.js` and add in your configuration details (see `./configs.js.example` for the template)
- `node ./setup/dbSetup.js` to initialize database
- install [PM2](https://github.com/Unitech/pm2) `npm install pm2 -g`
  - other tools will let you keep the application up and running on your server (e.g. [Forever](https://github.com/foreverjs/forever))
- start the server
```
pm2 start server.js --name="kobo2geojson_3020" --interpreter=/home/ubuntu/.nvm/versions/node/v10.15.2/bin/node
```
- to have the app restart itself after a reboot, server downtime, etc., you can generate a startup script
  - see the [PM2 documentation](https://github.com/Unitech/pm2#startup-hooks-generation) on this for more details
- install nginx
```
sudo apt install nginx
sudo vim /etc/nginx/sites-available/myconfig
# see `./nginx-config.example`
sudo ln -s /etc/nginx/sites-available/myconfig /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo vim /etc/nginx/nginx.conf
# uncomment "server_names_hash_bucket_size 64;"
sudo service nginx restart
```
