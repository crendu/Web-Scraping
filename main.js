var http    = require('http');	// Need module http
var express = require('express');
var path    = require('path');
var request = require('request');
var cheerio = require('cheerio');
var fs      = require('fs');
var LBC     = require('./leBonCoin.js');
var app = express();

var port = 8080;
var url = process.argv.slice(2);

// Pour exécuter: node main.js https://www.leboncoin.fr/ventes_immobilieres/1090849253.htm?ca=12_s 

request("" + url, function(err, resp, body) {	
										/*************
										 * leBonCoin *
										 *************/

	var $ = cheerio.load(body);
	var prix = $('#adview section section section.properties.lineNegative div:nth-child(5) h2 span.value');
	var ville = $('#adview section section section.properties.lineNegative div.line.line_city h2 span.value');
	var type = $('#adview section section section.properties.lineNegative div:nth-child(7) h2 span.value');
	var surface = $('#adview section section section.properties.lineNegative div:nth-child(9) h2 span.value');
	
	// permet de checker si il y a une case frais d'agence
	/*var testType = type.text();
	if(testType != 'Maison' || testType != 'Appartement') {
		var type = $('#adview section section section.properties.lineNegative div:nth-child(8) h2 span.value');
		var surface = $('#adview section section section.properties.lineNegative div:nth-child(10) h2 span.value');
	}*/

	var prixText = prix.text();
	var prixText = prixText.replace(/\s/g,"");
	var villeText = ville.text();
		villeText = villeText.substring(0, villeText.length - 17);
	var typeText = type.text();
	var surfaceText = surface.text();
	
	var LBC = {
		prix: prixText,
		ville: villeText,
		type: typeText,
		surface: surfaceText  
	};
	
	console.log("\néléments venant de la page leBonCoin ");
	console.log(LBC);
	
	
	
										/*******************
										 * meilleursAgents *
										 *******************/
										 
	//check si il y a des arrondissements
	/* var arrondissement = '';
	 * if(villeText.substring(0, 5)) = 'Paris' || villeText.substring(0, 4)) = 'Lyon' || villeText.substring(0, 9)) = 'Marseille') {
	 *	if(villeText.substring(villeText.length - 3, villeText.length -2) == 1 || villeText.substring(villeText.length - 3, villeText.length -2) == 2) {
	 *		arrondissement = villeText.substring(villeText.length - 3, villeText.length - 1);
	 *		arrondissement += 'eme-arrondissement-');
	 *	} else {
	 *		arrondissement = villeText.substring(villeText.length - 2, villeText.length - 1);
	 *		arrondissement + 'eme-arrondissement-';		
	 *	}
	 * }
	 * arrondissement += villeText.substring(villeText.length - 6, villeText.length - 1); 
	 * villeText += villeText.substring(0, villeText.length - 6) + arrondissement;*/
	
	villeText = villeText.toLowerCase();
	villeText = villeText.replace(/\s/g,"-");
	request("https://www.meilleursagents.com/prix-immobilier/" + villeText, function(err, resp, body) {
		var $ = cheerio.load(body);
		var prixm2;
		
		if(typeText = "Appartement") {
			prixm2 = $('#synthese div.prices-summary.baseline div.prices-summary__values div:nth-child(2) div.small-4.medium-2.columns.prices-summary__cell--median');
		} else {
			prixm2 = $('#synthese div.prices-summary.baseline div.prices-summary__values div:nth-child(3) div.small-4.medium-2.columns.prices-summary__cell--median');
		}
		
		var prixm2Text = prixm2.text();
		var prixm2Text = prixm2Text.replace(/\s/g,"");
		var MA = { prixm2: prixm2Text };
		
		console.log("\néléments venant de la page meilleursAgents ");
		console.log(MA);
		
		
		
										/**********
										 * Calcul *
										 **********/
										 
		prixText = parseInt(prixText.substring(0, prixText.length - 1));
		surfaceText = parseInt(surfaceText.substring(0, surfaceText.length - 3));
		prixm2Text = parseInt(prixm2Text.substring(0, prixm2Text.length - 1));
		
		var calcul = surfaceText * prixm2Text;
		var diff = prixText - calcul;
		
		if(diff >= 100) { console.log("\nC'est une mauvaise affaire, le prix est de " + diff + "€ trop élevé."); }
		else if(diff > 0 && diff < 100) { console.log("\nC'est une affaire raisonnable, le prix est de " + diff + "€ trop élevé."); }
		else { console.log("\nC'est une bonne affaire, vous économisez " + (diff * (-1)) + "€"); }
	});
});

app.listen(port);
console.log('listenning on port ' + port);


/**************************************************************************************************/
										/**************
										 * accès http *
										 **************/
/* var http = require('http');	// Need module http
 * var display = require('./affichage.js');
 *
 *function get (url_LBC) {
 *	var request = http.get("http://" + url_LBC, function(response) {
 *		var body = "";
 *		
 *		response.on('data', function(chunk) {
 *			body += chunk;
 *		});
 *		response.on('end', function() {
 *			if(response.statusCode === 301) {
 *				try {
 *					display.printMessage(url_LBC, prix, ville, type, surface);
 *				} catch(error) {
 *					display.printError(error);
 *				}
 *			} else {
 *				display.printError({ message : "page innaccessible" });
 *			}
 *		});
 *	}).on('error', display.printError);
 * }
 * module.exports.getLBC = get;*/
 
/**************************************************************************************************/
										/*************
										 * affichage *
										 *************/
/* function printMessage(adresse_LBC, prix, ville, type, surface) {
 *	console.log("L'offre : " + adresse_LBC + " située à " + ville + " est un(e) " + type + " de " + surface + "m² et le prix s'élève à " + prix + "€\n");
 * }
 * function printError(error) {
 *	console.error(error.message);
 * }
 * module.exports.printMessage = printMessage;
 * module.exports.printError = printError;*/
 
/**************************************************************************************************/
/* var destination = fs.createWriteStream('./downloads/leboncoin.html');
 * request(url)
 *	.pipe(destination);
 *	.on('finnish', function() {
 *		console.log('download done');
 *	}).on('error', display.printError); */ 

/*------------------------------------------------------------------------------------------------*/

/* request(url, function(err, resp, body) {
 *	if(err) {
 *		console.log(err);
 *	} else {
 *		console.log(body);
 *	}
 * }); */
 
/*------------------------------------------------------------------------------------------------*/

/*http.createServer(function(request, response) {
	response.writeHead(200);
	
	//demande à l'utilisateur l'url leboncoin
	var url_LBC = process.argv.slice(2);
	//exécute leBonCoin.js
	LBC.getLBC(url_LBC);
	//exécute meilleurAgent.js
	//calcul du prix au m² (prixMoyen.meilleurAgent * surface.leBonCoin)
	//if(cacul >= prix.leBonCoin) ==> bonne affaire 
	
	console.log(body);
	
	response.end();
}).listen(port);
console.log('listenning on port ' + port);*/
