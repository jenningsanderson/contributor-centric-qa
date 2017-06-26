'use strict';

var fs = require('fs')
var path = require('path');
var tileReduce = require('tile-reduce');
var _ = require('lodash')
var out = {"type":"FeatureCollection","features":[]}


var year = process.argv[2]

console.log(year, "/data/osm/osm-qa-tiles/"+(year+1)+"0101-slim-planet.mbtiles")

var outFile = `/data/osm-analysis/tsv/${year}-users-per-tile-slim-planet.csv`

var user_summary = {}
tileReduce({
    zoom: 12,
    sources: [{name: 'osm', mbtiles: "/data/osm/osm-qa-tiles/"+(Number(year)+1)+"0101-slim-planet.mbtiles", raw: false}],
    map: path.join(__dirname, '/map-user-per-tile-to-csv.js'),
    output: fs.createWriteStream(outFile),
//    bbox: [-74.259094,40.477398,-73.700165,40.91758],
    maxWorkers: 18,
    mapOptions : {
      'analysis_year' : year,
      'edits_greater_than_timestamp': Date.UTC(year,0,1,0,0,0)/1000
    }
  })
.on('reduce', function(res) {
  Object.keys(res).forEach(function(uid){
    if (user_summary[uid]){
      ['road_km','buildings','amenities','edits'].forEach(function(key){
        if(res[uid][key]>0)
	  user_summary[uid][key] += res[uid][key]
      });
      user_summary[uid]['EditingDays'] = _.union(user_summary[uid]['EditingDays'], res[uid]['EditingDays'])
    }else{
      user_summary[uid] = res[uid]
    }
  })


})
.on('end', function() {
  var user_out = fs.createWriteStream(`/data/osm-analysis/tsv/${year}-user_data-slim-planet.tsv`);
  Object.keys(user_summary).forEach(function(uid){

    user_out.write(
              [ uid,
                user_summary[uid]['name'].replace(/\\/g,"").replace("/\t/","").replace(/\t/g," "),
                year,
                user_summary[uid]['buildings'],
                user_summary[uid]['road_km'],
                user_summary[uid]['amenities'],
                user_summary[uid]['edits'],
                "{"+user_summary[uid]['EditingDays'].toString()+"}"
              ].join("\t")+"\n");
  });
});