var express = require('express')
var cheerio = require('cheerio')
var htmlSnapshots = require('html-snapshots')
var assert = require("assert")
var fs = require('fs')
// MySQL module and heroku info
var mysql = require('mysql');
var pool = mysql.createPool({
  	host : 'us-cdbr-iron-east-03.cleardb.net',
  	user : 'bb08a4822ce4b1',
  	password : '10f0179b',
  	database: 'heroku_59370a6610ff7e4'
});
var app = express()

app.listen(8000, function(){
  console.log("Listening for Uncle Ike's on port 8000");
});


app.get('/', function(req, res){

	//takes a snapshot of the html after "selector" tag is visible and each website in array
	var result = htmlSnapshots.run({
		input:"array",
	  // source: "/menu/",
	  source: ["http://uncleikespotshop.com/menu"],
	  outputDir: "./snapshots",
	  // outputDirClean: true,  
	  selector: "#imp-love",
	  snapshotScript: {
	    script: "removeScripts"
	  }
	}, function(err, snapshotsCompleted) {
		//callback where snapshotCompleted is all the snapshots in a array
		console.log(snapshotsCompleted)

	 //removes script tags for each snapshot
	  snapshotsCompleted.forEach(function(snapshotFile) {
	    content = fs.readFileSync(snapshotFile, { encoding: "utf8"});    
	    assert.equal(false, /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(content));
	    // there are no script tags in the html snapshots 
		})

	 //throws content into parse_info function to populate array
	  parse_data(content)
	   function parse_data(info){
		   var $ = cheerio.load(info);
		   var strainName = [];
		   var strainPrice_Weight = [];
		   // var myArrayDescription = [];

		   $('.imp-name').each(function(){strainName.push($(this).text());});
		   $('.imp-price').each(function(){strainPrice_Weight.push($(this).text());});
		   // $('.imp-extras').each(function(){myArrayDescription.push($(this).text());});

		  console.log("strain name is", strainName);
		  console.log("strain price and weight is", strainPrice_Weight);
		  // console.log(myArrayDescription);

		module.exports = (function() {
			// return {
				// add: function(req, res) {[[]]
					var connection1;
					pool.getConnection(function(err, connection) {
						connection1=connection;
						insert(connection1, function(){
							connection1.release();
						});
					});

					function insert(connection, callback){
						for(var i=0; i<strainName.length; i++){
							var post = {vendor_id: 1528, strain_name: strainName[i], price_weight: strainPrice_Weight[i]};
							connection.query("INSERT INTO uncleikes_menu SET ?, created_at = NOW(), updated_at = NOW()", post, function(error, reservations, fields) {
									if (error) {
										console.log(error);
									} else {
										console.log("inserted successfully");
									}
								})
						}
						callback();
					}
			})();
		}
	});
})