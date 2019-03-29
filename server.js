var fs = require('fs')
var express = require('express')
var localConfig = require('./config')
var CronJob = require('cron').CronJob

var PostGresHelper = require('./routes/PostGresHelper.js')
var pghelper = new PostGresHelper()

var ETL = require('./routes/ETL.js')
var etl = new ETL()

var app = express()
var api = express.Router()

api.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
});

api.get('/raw', function(req, res) {
  var sql = "SELECT * FROM data.surveys"
  pghelper.query(sql, function(err, results) {
    res.send(results) 
  })
})

// get a list of all the fields we want to add to our geojson features as attributes
var fields = [
  "imageurl"
  // ,"id"
  // ,"uuid"
  // ,"submissiontime"
]
localConfig.kobo.form.fields.forEach(function(item,index) {
  fields.push(item.name)
})

api.get('/all', function(req, res) {
  var sql = "SELECT row_to_json(fc) "+
   "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "+
   "FROM (SELECT 'Feature' As type "+
      ", ST_AsGeoJSON(lg.geom)::json As geometry"+
      ", row_to_json((SELECT l FROM (SELECT " + fields.join(", ") + ") As l"+
        ")) As properties "+
     "FROM (SELECT * FROM data.surveys) As lg ) As f )  As fc;";
  pghelper.query(sql, function(err, results) {
    if(err) { console.log(err) }
    res.send(results[0]["row_to_json"])
  })
})

api.get('/json', function(req, res) {
  var sql = "SELECT row_to_json(fc) "+
   "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "+
   "FROM (SELECT 'Feature' As type "+
      ", ST_AsGeoJSON(lg.geom)::json As geometry"+
      ", row_to_json((SELECT l FROM (SELECT " + fields.join(", ") + ") As l"+
        ")) As properties "+
     "FROM (SELECT * FROM data.surveys) As lg ) As f )  As fc;";
  pghelper.query(sql, function(err, results) {
    if(err) { console.log(err) }
    res.json(results[0]["row_to_json"])
  })
})

api.get('/filejson', function(req, res) {
  var sql = "SELECT row_to_json(fc) "+
   "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "+
   "FROM (SELECT 'Feature' As type "+
      ", ST_AsGeoJSON(lg.geom)::json As geometry"+
      ", row_to_json((SELECT l FROM (SELECT " + fields.join(", ") + ") As l"+
        ")) As properties "+
     "FROM (SELECT * FROM data.surveys) As lg ) As f )  As fc;";
  pghelper.query(sql, function(err, results) {
    if(err) { console.log(err) }
    fs.writeFileSync('./tmp/map.json', JSON.stringify(results[0]["row_to_json"]), 'utf8', function(err) {
      if(err) { console.log (err) }
    })
    res.download('./tmp/map.json', 'map.json', function(err) {
      console.log('hey')
      fs.unlink('./tmp/map.json', function(err) { console.log(err) })
    })
    
  })
})

api.get('/filegeojson', function(req, res) {
  var sql = "SELECT row_to_json(fc) "+
   "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "+
   "FROM (SELECT 'Feature' As type "+
      ", ST_AsGeoJSON(lg.geom)::json As geometry"+
      ", row_to_json((SELECT l FROM (SELECT " + fields.join(", ") + ") As l"+
        ")) As properties "+
     "FROM (SELECT * FROM data.surveys) As lg ) As f )  As fc;";
  pghelper.query(sql, function(err, results) {
    if(err) { console.log(err) }
    fs.writeFileSync('./tmp/map.geojson', JSON.stringify(results[0]["row_to_json"]), 'utf8', function(err) {
      if(err) { console.log (err) }
    })
    res.download('./tmp/map.geojson', 'map.geojson', function(err) {
      console.log('hey')
      fs.unlink('./tmp/map.geojson', function(err) { console.log(err) })
    })
    
  })
})

app.use('/api', api)


app.listen(localConfig.app.port, function() {
  console.log('Listening on port ' + localConfig.app.port);
});


new CronJob({
  // run on start and every 30 minutes
  cronTime: '0 */30 * * * *',
  onTick: function() {
    etl.run(function(err, results){
      if(err) { 
        console.log(err)
      } else {
        console.log(results)
      }
    })
  },
  start: true,
  runOnInit: true
})
