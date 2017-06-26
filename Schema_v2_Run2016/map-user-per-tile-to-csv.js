'use strict';

var fs = require('fs')
var _ = require('lodash')
var turf = require('turf')
var tb = require('tilebelt')

//var utils = require('../utils/utils.js')

module.exports = function(data, tile, writeData, done) {

  //Extract the osm layer from the mbtile
  var layer = data.osm.osm;
  /*
    Group edits by the user
  */
  var edits_by_uid = {}

  var user_prop_template = {
	   'road_km':0,
 	   'buildings':0,
	   'amenities':0,
     'edits': 0,
	   'EditingDays':[]
	}

  var quadKey = tb.tileToQuadkey(tile)

  // Iterate over all the features of this tile
  layer.features.forEach(function(feat){

    var id   = feat.properties['@id']
    var type = feat.properties['@type']
    var t    = parseInt(feat.properties['@timestamp']) //This is in seconds since epoch (Not milliseconds)

    // If the edit happened outside of *this* time window, skip it
    if (t < mapOptions.edits_greater_than_timestamp) return

    var uid  = feat.properties['@uid']
    var name = feat.properties['@user']

    var dayOfEdit = Math.floor((t - mapOptions.edits_greater_than_timestamp)/86400)

    var road_km;

    if (feat.properties.highway && feat.geometry.type === "LineString")
      road_km = turf.lineDistance(feat, "kilometers")

    if (edits_by_uid[uid]==undefined){
       edits_by_uid[uid] = JSON.parse(JSON.stringify(user_prop_template));
       edits_by_uid[uid]['name'] = name
    }

    if (road_km) edits_by_uid[uid]['road_km'] += road_km;

    if (feat.properties.building) edits_by_uid[uid]['buildings'] += 1;

    if (feat.properties.amenity) edits_by_uid[uid]['amenities'] += 1;

    edits_by_uid[uid]['EditingDays'].push(dayOfEdit)
    edits_by_uid[uid]['edits'] += 1

  });

  Object.keys(edits_by_uid).forEach(function(uid){
    edits_by_uid[uid]['EditingDays'] = _.uniq(edits_by_uid[uid]['EditingDays']);

    writeData([ quadKey,
                mapOptions.analysis_year,
                uid,
                edits_by_uid[uid]['buildings'],
                edits_by_uid[uid]['road_km'],
                edits_by_uid[uid]['amenities'],
                edits_by_uid[uid]['edits'],
                "\"{"+edits_by_uid[uid]['EditingDays'].toString()+"}\""
              ].join(",")+"\n");
    });

  done(null, edits_by_uid)
};
