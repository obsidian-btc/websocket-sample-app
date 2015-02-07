var vertx = require('vertx-eventbus-client');

var eb = new vertx.EventBus('http://localhost:8081/eb');

var token = '1uujt/6iFcNdgCKPbz8nkQ==';

var btcUsdMarket;
var currentBalances;

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
                    order_type: 'limit'};
  eb.send('api.place_order', parameters, function(reply) {
    console.log(reply);
    if (reply != 'undefined' && reply.status === 'success') {
      placedOrders.push(reply.order.id);
    } else {
      console.log(reply);
    }
    return reply;
  });
};

cancelOrder = function(orderId) {
  parameters = {
    id: orderId
  };
  eb.send('api.cancel_order', parameters, function(reply) {
    console.log(reply);
  });
};

getBalances = function() {
  parameters = {
    portfolio_id: portfolioId
  };
  eb.send('publish_portfolio_balances', parameters);
};

getMarketSummaries = function() {
  eb.send('get_market_info', {market_name: 'btc_usd'});
}

var start = null;

eb.onopen = function() {
  console.log('Connection opened.');

  eb.login(token, function(reply) {
    var sessionID = reply.sessionID;
    console.log(reply);

    eb.registerHandler('api.markets.btc_usd', function(message){
      btcUsdMarket = message;
      console.log(btcUsdMarket.best_ask);
    });

    eb.registerHandler('api.orders.' + sessionID, function(message) {
      console.log(message);
      if (message.length === 0) {
        console.log("Empty: " + (new Date() - start));
      }
    });

    eb.registerHandler('api.balances.' + sessionID, function(message) {
      currentBalances = message;
      console.log(message);
    });

    start = new Date();
    loadtest();
  });
};

var batchSize = 5;

var loadtest = function() {
  for (var i = 0; i < batchSize; i++) {
    placeOrder('buy', 1000000, 100000);
  }
  console.log("Orders placed " + (new Date() - start));
  // setTimeout(cancelOrders, 5000);
}

var cancelOrders = function() {
  console.log("Cancelling " + placedOrders.length + " orders")
  for (var i = 0; i < placedOrders.length; i++) {
    cancelOrder(placedOrders[i]);
  }
}

var buySomeBTC = function() {
  placeOrder('buy', 10000, 10000);
};

// setTimeout(getBalances, 1000);
// setTimeout(getMarketSummaries, 1000);
// setTimeout(buySomeBTC, 3000);



