## kobo2geojson

API for taking data from a survey on KoBo and serving is as a publicly available GeoJSON.

### Development

- install PostgreSQL (11.2) and PostGIS (2.5.1), on OSX you can do this easily with https://postgresapp.com
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
- install PostgreSQL (11.2) and PostGIS (2.5.1)
  - create an empty database, e.g. `createdb assessment` (name should match whatever you set in `config.js` for `config.pg.database`)
- install Node.js (10.15.2)
  - suggested to install [nvm](https://github.com/creationix/nvm)
  - and run `nvm install 10.15.2` and `nvm use`
- `npm install` to install node module dependencies
- `node ./setup/dbSetup.js` to initialize database
- `nvm use default`
- install [PM2](https://github.com/Unitech/pm2) `sudo npm install pm2 -g`
  - other tools will let you keep the application up and running on your server (e.g. [Forever](https://github.com/foreverjs/forever))
- `pm2 start server.js --name="kobo2geojson_3020" --interpreter=/home/ubuntu/.nvm/versions/node/v10.15.2/bin/node` to start the app
  - to have the app restart itself after a reboot, server downtime, etc., you can generate a startup script
  - see the [PM2 documentation](https://github.com/Unitech/pm2#startup-script-generation) on this for more details