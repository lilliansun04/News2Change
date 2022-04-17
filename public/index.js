#!/usr/bin/nodejs


// -------------- load packages -------------- //
var express = require('express');
var app = express();

var hbs = require('hbs');
var https = require('https');
const download = require('image-downloader');
const fs = require('fs')
const request = require('request')



var data = '';
const Geocodio = require('geocodio-library-node');
const geocoder = new Geocodio('0b1859b134514599962b15635bf933423b356b2');

// const {google} = require('googleapis');
// const civicinfo = google.civicinfo('v2');

// -------------- express initialization -------------- //

// tell express that the view engine is hbs
app.set('view engine', 'hbs');

// serve files from the static directory (https://expressjs.com/en/starter/static-files.html)
// the following line is a directive to serve all files in all subfolders 
app.use(express.static('static'));


function downloadImage(url, filepath) {
    return download.image({
       url,
       dest: filepath 
    });
}

// -------------- express 'get' handlers -------------- //

app.get('/', function(req, res){

	// get latitute and longitude


    // render the template
    res.render('index');

});

app.get('/contacted', function(req, res){
	res.render('contacted');
})

app.get('/reps', function(req, res){


		if('lat' in req.query){

			var lat = Number(req.query.lat);
			var long = Number(req.query.long);

			geocoder.reverse(""+lat +"," + long)
			  .then(response => {
			     // address = response[0].formatted_address;
			     var actualAddress = response.results[0].formatted_address;
			     const search = ' ';
				 const replaceWith = '%20';
				var address = actualAddress.split(search).join(replaceWith);
				console.log(address)

				
			    var url = "www.googleapis.com/civicinfo/v2/representatives?key=AIzaSyCrL1K45L0blXvtPod35xY1Bo0-qBJAOOc&address=" + address
			    console.log(url)

			    const options = {
				  hostname: 'www.googleapis.com',
				  port: 443,
				  path: '/civicinfo/v2/representatives?key=AIzaSyCrL1K45L0blXvtPod35xY1Bo0-qBJAOOc&address=' + address,
				  method: 'GET',
				  headers: {
				    'Accept': 'plain/html',
				    'Accept-Encoding': '*',
				  }
				}


			    		https.get(options, function(response) {


							var rawData = '';

							response.on('data', function(chunk) {
						    	rawData += chunk;

						    });

							response.on('end', function() {

							  obj = JSON.parse(rawData);
							  console.log(obj)
							  status = obj.status;
							  var senator1 = obj.officials[2]
							  var senator2 = obj.officials[3]
							  var local_rep = obj.officials[4]
							  var governor = obj.officials[5]
							  var urlSen = senator1.photoUrl


								const url = urlSen
								

								  	out = {
								  		address: actualAddress,
										senator1: senator1.name,
										senator1link: url,
										party1: senator1.party,
										contact1: senator1.urls[0],

										senator2: senator2.name,
										senator2link: senator2.photoUrl,
										party2: senator2.party,
										contact2: senator2.urls[0],


										local_rep: local_rep.name,
										local_replink: local_rep.photoUrl,
										party3: local_rep.party,
										contact3: local_rep.urls[0],

										governor: governor.name,
										governorlink: governor.photoUrl,
										party4: governor.party,
										contact4: governor.urls[0]

									};

								  res.render("reps", out)

						});

					}).on('error', function(e){
						console.error(e);

					}).end();


				

			  })
			  .catch(err => {
			    console.error(err);
			  }
			);

		}
/*
  	out = {
  		address: "Address not found",
		senator1: "Senator 1",
		senator2: "Senator 2",
		local_rep: "Your local representative",
		governor: "Your governor"
	};

	console.log

 	res.render('reps', out)
 	*/
});
 

// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

var listener = app.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", function() {
    console.log("Express server started");
});
