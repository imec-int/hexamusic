// THIS ONE SEARCHES FOR COMPLETE TWEETS ABOUT A CERTAIN TAG


var OAuth       = require('oauth').OAuth;
var querystring = require('querystring');
var config 		= require('./config');

var updateCallback = null;

exports.onUpdate = function (callback) {
	updateCallback = callback;
};

// authentication for other twitter requests
var twitterOAuth = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	config.twitter.key,
	config.twitter.secret,
	"1.0",
	null,
	"HMAC-SHA1"
);

var tweetsBuffer = [];

searchTwitterForHash(encodeURIComponent(config.app.searchterms.join(' OR ')), function (err, tweets){
	for(var i = 0; i < tweets.length; i++)
		if(tweetsBuffer.indexOf(tweets[i]) < 0) tweetsBuffer.push(tweets[i]);
	// console.log(tweetsBuffer.length);
	startSearchHose();
	displayTweets();
});

var currentIndex = 0;
var timeoutHandle;
function displayTweets(){
	if(updateCallback){
		// console.log(tweetsBuffer[currentIndex]);
		updateCallback({tag:tweetsBuffer[currentIndex++],count:100});
		if(currentIndex >= tweetsBuffer.length) currentIndex = 0;
		timeoutHandle = setTimeout(displayTweets, 5000);
	}
}

function startSearchHose(){
	// 2.) Luister ook naar nieuwe pictures die binnenkomen:
	var parameters = querystring.stringify({
		track: config.app.searchterms.join(',')
	});

	var twitterhose = twitterOAuth.get('https://stream.twitter.com/1.1/statuses/filter.json?' + parameters, config.twitter.usertokens.token, config.twitter.usertokens.secret);
	twitterhose.addListener('response', function (res){
		console.log("searchhose started");
		res.setEncoding('utf8');
		res.addListener('data', function (chunk){
			try{
				var tweet = JSON.parse(chunk);
				if(tweetsBuffer.indexOf(tweet) < 0)
					tweetsBuffer[currentIndex] = tweet.text;
			}catch(err){}
		});

		res.addListener('end', function(){
			console.log("Twitterhose broke down");
		});
	});
	twitterhose.end();
}

function searchTwitterForHash (hash, callback) {
	twitterOAuth.getProtectedResource('https://api.twitter.com/1.1/search/tweets.json?q=' + hash + '&src=hash', "GET", config.twitter.usertokens.token, config.twitter.usertokens.secret,
		function(error, data, response){
			if(error){
				callback(error);
				console.log(error);
			}
			else{
				var tweets = [];
				// console.log(data);
				data = JSON.parse(data);
				for(var i=0; i<data.statuses.length; i++){
					tweets[i] = data.statuses[i].text;

				}
				callback(null, tweets);
			}
		}
	);
}






