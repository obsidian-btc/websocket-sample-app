var vertx = require('vertx-eventbus-client');

var eb = new vertx.EventBus('https://demo.obsidianexchange.com:443/eventbus');
var portfolioId = "SOME-PORTFOLIO-ID";
var btcUsdMarket;
var currentBalances;

printBestAsk = function() {
  console.log(btcUsdMarket.best_ask);
};

// action: ['buy', 'sell']
// quantity: number of satoshi: 1e8 == 1 BTC
// price: price in cents: 40000 == $400.00
// order_type: ['limit', 'market']
placeOrder = function(action, quantity, price) {
  var parameters = {
                    action: action,
                    market_name: 'btc_usd',
                    price: price,
                    quantity: quantity,
                    order_type: 'limit',
                    portfolio_id: portfolioId};
  eb.send('place_order', parameters, function(reply) {
    console.log(reply);
    return reply;
  });
};

cancelOrder = function(orderId) {
  parameters = {
    id: orderId
  };
  eb.send('cancel_order', parameters);
};

getBalances = function() {
  parameters = {
    portfolio_id: portfolioId
  };
  eb.send('check_portfolio_balances', parameters);
};

getMarketSummaries = function() {
  eb.send('markets.info', {market_name: 'btc_usd'});
}

eb.onopen = function() {
  console.log('Connection opened.');

  eb.registerHandler('markets.btc_usd', function(message){
    btcUsdMarket = message;
    console.log(btcUsdMarket.best_ask);
  });

  eb.registerHandler('portfolio_orders.' + portfolioId, function(message) {
    console.log(message);
  });

  eb.registerHandler('portfolio_accounts.balances.' + portfolioId, function(message) {
    currentBalances = message;
    console.log(message);
  });

  // eb.login('superusername', 'superpassword', function(reply) {
  //   console.log(reply);
  // });
};

var buySomeBTC = function() {
  placeOrder('buy', 10000, 10000);
};

setTimeout(getBalances, 1000);
setTimeout(getMarketSummaries, 1000);
// setTimeout(buySomeBTC, 3000);

