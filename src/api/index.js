import ccxt from 'ccxt'

export const initBinanceExchange = (user) => {
  return new ccxt.binance({
    apiKey: user.apiKey,
    secret: user.secret,
    timeout: 15000,
    enableRateLimit: true,
    options: {
      adjustForTimeDifference: true,
      verbose: true, // if needed, not mandatory
      recvWindow: 10000000, // not really needed
      defaultType: 'future', //預設合約市場
    },
  })
}

// 時間
export const getServerTime = (binance_exchange) => {
  if (!binance_exchange) return
  return binance_exchange.fapiPublicGetTime()
}

// log出來的function可以直接call 如底下getPosition
export const getAllImplicitApiMethods = () => {
  // console.log (binance_exchange)
  // return binance_exchange
}

//為了獲取交易最低單位
export const getMarkets = (binance_exchange) => {
  if (!binance_exchange) return
  return binance_exchange.fetchMarkets()
}

//獲取交易對數據
export const getTicker = (symbol, binance_exchange) => {
  if (!binance_exchange || !symbol) return
  // return binance_exchange.fapiPublicGetTickerPrice({"symbol": symbol}) //這隻的symbol不用slash(/)
  return binance_exchange.fetch_ticker(symbol) // 這隻要slash
}

export const getIncome = (binance_exchange) => {
  if (!binance_exchange) return
  return binance_exchange.fapiPrivateGetIncome()
}

//查詢餘額
export const getBalance = (binance_exchange) => {
  if (!binance_exchange) return
  return binance_exchange.fapiPrivateV2GetBalance()
}

//查詢現在合約倉位資訊
//binance 的fapiPrivateGetAccount裡面有position資訊
export const getPosition = (binance_exchange) => {
  if (!binance_exchange) return
  return binance_exchange.fetch_positions()
}

//取得帳戶資訊,裡面有很多資料
export const getAccount = (binance_exchange) => {
  if (!binance_exchange) return
  return binance_exchange.fapiPrivateGetAccount()
}

//改變槓桿值
export const changeLeverage = (binance_exchange, userSymbol, userLeverage) => {
  if (!binance_exchange) return
  return binance_exchange.fapiPrivatePostLeverage({
    symbol: userSymbol,
    leverage: userLeverage,
  })
}

//市價買賣單
//amount 開的數量
//(保證金*槓桿 )/ 現在的幣價  = 最大可開的數量，最大可開數量 乘上 你要的開倉輸入的%數 就是開倉數量(amount)

//市價開倉
export const openMarketOrder = (binance_exchange, symbol, side, amount) => {
  if (!binance_exchange) return
  return binance_exchange.createOrder(symbol, 'market', side, amount)
}

//市價平倉
export const closeMarketOrder = (binance_exchange, symbol, side, amount) => {
  if (!binance_exchange) return
  // ccxt.binance.createOrder()
  // createMarketOrder (symbol: string, side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
  // return binance_exchange.createMarketOrder( symbol, side, amount, 0.3, {"reduceOnly":true} )
  // return binance_exchange.createOrder(symbol, 'market', side, amount,{"reduceOnly":true})
  //還沒修好 要加上reduce only
  return binance_exchange.createOrder(symbol, 'market', side, amount, undefined, {"reduceOnly":true})
}


//市價止損單
export const marketStopLoss = async (binance_exchange, symbol, side, amount,  stopPrice) => {
  if (!binance_exchange) return
  return binance_exchange.createOrder(
    symbol,
    'STOP_MARKET',
    side,
    amount,
    //params, stopPrice:觸發價格
    undefined,
    {
      "stopPrice": stopPrice, // your stop price 勿動 強制加上
      "closePosition":true // 觸發後全部平倉，只平倉效果
    }
  )
}

export const trailingStop = (binance_exchange, symbol, side, amount, activationPrice, callbackRate) => {
  if (!binance_exchange) return
  return binance_exchange.createOrder(
    symbol,
    'TRAILING_STOP_MARKET',
    side,
    amount,
    undefined,
    //params, stopPrice:觸發價格, callbackRate:回調率
    {
      'activationPrice': activationPrice,
      'callbackRate': callbackRate
      }
  )
}
//取消全部委託單 不能用
export const cancelAllOrder = (binance_exchange, symbol, timestamp) => {
  if (!binance_exchange) return
  return binance_exchange.fapiPrivateDeleteAllOpenOrders({
    symbol: symbol,
    timestamp: timestamp,
  })
}

//取得交易資料
export const getTrades = (binance_exchange) => {
  if (!binance_exchange) return
  return binance_exchange.fapiPrivateGetUserTrades()
}
