/**
 * Simple script for listening for web hooks from github and enable 
 * automatic deployment of builds for self-hosted websites and services!
 */

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var exec = require('child_process').execSync;
var config = require('./config');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Web hook endpoint
 */
app.post('/git', function (req, res) {
	// Just to keep github happy, we will always respond with a 200
	res.sendStatus(200);

	console.log(`Recieving web hook for the ${req.body.repository.name} repository!`);

	if(!config.hasOwnProperty(req.body.repository.name)){
		console.log("No config data found for this repository. Aborting")
		return;
	}
	var repository = config[req.body.repository.name];	
	console.log("Pulling files");
	// Reset any changes that have been made or added locally
	exec(`git -C ${repository["localPath"]} reset --hard`, {stdio:[0,1,2]} );
	exec(`git -C ${repository["localPath"]} clean -df`, {stdio:[0,1,2]});
	exec(`git -C ${repository["localPath"]} pull -f`, {stdio:[0,1,2]});
	
	if(needNPMInstall(req.body.commits)){
		console.log("Need to install packages, this can take some time.");
		exec(`npm -C ${repository["localPath"]} install `, {stdio:[0,1,2]});
	}else{
		console.log("Didn't need to install any packages");
	}
	
	console.log("Building distribution files");
	exec(`npm -C ${repository["localPath"]} ${repository["buildCommand"]}`, {stdio:[0,1,2]});

	if(repository.hasOwnProperty("serviceWorkerFile")){
		console.log("Run service worker setup script");
		exec(`node ${repository["localPath"]}/${repository["serviceWorkerFile"]}`, {stdio:[0,1,2]});
	}

	console.log("Copy all distribution files to destination");
	exec(`sudo cp -v -a ${repository["localPath"]}/${repository["distributionFolder"]}/* ${repository["destinationPath"]}`, {stdio:[0,1,2]});
});

app.listen(config["port"], function () {
	console.log(`Listening for incoming git hooks on port ${config["port"]}`)
});

function needNPMInstall(commits){
	if(commits.length>0){
	 	for(i in commits){
		   if(commits[i].modified.indexOf("package.json") > -1){
			return true;
		   }	
		}
	}
	return false;
}