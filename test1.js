const binance = require('node-binance-api');

binance.options({
  APIKEY: '',
  APISECRET: '',
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true // If you want to use sandbox mode where orders are simulated
});


var returnFlag = false;

function delay(delayInMilliseconds) {
	setTimeout(function() {}, delayInMilliseconds);
}
var PRICES_BUFFER = 10; // 
var smaLENGTH = 3; // simple moving averge of 20 

var market = {
	prices:Array(), // buffer of coin's price
	iPrices:0,
	sma:Array(), // buffer of coin's SMA
	max:Array(),
	min:Array(),
	init: function() {
		// init prices
		coins = Array("ETHBTC", "LTCBTC", "BNBBTC");
		for (var i in coins)
		{
			this.max[coins[i]] = { 'value': Number.MIN_SAFE_INTEGER, 'timestamp' : Date.now()};
			this.min[coins[i]] = { 'value': Number.MAX_SAFE_INTEGER, 'timestamp' : Date.now()};
			this.prices[coins[i]] = Array();
			this.sma[coins[i]] = Array();
			for (j = 0; j < PRICES_BUFFER; j++)
			{
				this.prices[coins[i]][j] = 0;
				this.sma[coins[i]][j] = 0;
			}
		}
	},
	refresh: function() { 
		 	coins = Array("ETHBTC", "LTCBTC", "BNBBTC"); // put here all the coins you want to trade
		 	binance.prices((error, lastPrices) => {
		 	var d = new Date();
	  		var datetime = d.getFullYear() +'-' + d.getMonth() + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
	  		console.log(datetime);
		 	// interate the coins 
		 	for (var i in coins )
		  	{
		  		var coin = coins[i];
		  		var value = eval("lastPrices." + coin);
		  		this.prices[coin][PRICES_BUFFER-1] = value;
	  		    // buffer is full and need to discard the oldest price and add the newest price 
	  			for (var n = 1; n < PRICES_BUFFER; n++)
	  			{
					this.prices[coin][n-1] = this.prices[coin][n];
	  			}

				// calculate SMA
				middleSMALEN = parseInt(smaLENGTH/2);
	  			for (var n = middleSMALEN; n < PRICES_BUFFER - middleSMALEN; n++)
	  			{
	  				var sum = 0;
	  				for (var m = n - middleSMALEN; m <= n + middleSMALEN; m++)
	  				{
	  					sum = sum + parseFloat(this.prices[coin][m]); 
	  				} 
	  				this.sma[coin][n] = parseFloat(sum/smaLENGTH).toFixed(8);
	  			}

		  		// get Maximum
		  		if (this.max[coin].value < lastPrices[coin])
		  		{
		  			this.max[coin].value = lastPrices[coin];
		  			this.max[coin].timestamp = Date.now();
		  		}
		  		// get Minimum
		  		if (this.min[coin].value > lastPrices[coin])
		  		{
		  			this.min[coin].value = lastPrices[coin];
		  			this.min[coin].timestamp = Date.now();
		  		}
		  		console.log('');
		  		console.log(coin, ": ");
		  		console.log("prices: ", this.prices[coin].toString());
				console.log("SMA: ", this.sma[coin].toString());
		  	}
		  console.log("<======================================================================================================>");
		  //delay(3000); // request prices every 3 seconds
		  setTimeout(function() {market.refresh();}, 3000);
		  		  
		});
	},
};

market.init();
market.refresh();