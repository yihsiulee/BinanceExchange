import ccxt from 'ccxt'
import { useEffect } from 'react'
import { REACT_APP_USER1_APIKEY, REACT_APP_USER1_SECRET } from '../config'

const binance_exchange = new ccxt.binance({
  apiKey: REACT_APP_USER1_APIKEY,
  secret: REACT_APP_USER1_SECRET,
  timeout: 15000,
  enableRateLimit: true,

  options: {
    adjustForTimeDifference: true,
    verbose: true, // if needed, not mandatory
    recvWindow: 10000000, // not really needed
    defaultType: 'future', //預設合約市場
  },
})

// 時間
export const getServerTime = () => {
  return binance_exchange.fapiPublicGetTime()
}

// log出來的function可以直接call 如底下getPosition
export const getAllImplicitApiMethods = () => {
  // console.log (binance_exchange)
  return binance_exchange
}

export const getExchageId = () => {
  return binance_exchange.id
}

export const getExchangeName = () => {
  return binance_exchange.name
}

export const getExchangeTime = () => {
  return binance_exchange.iso8601(binance_exchange.milliseconds())
}

//為了獲取交易最低單位
export const getMarkets = () => {
  return binance_exchange.fetchMarkets()
}

// export const getMarkets = () => {
//   return binance_exchange.fapiPublicGetExchangeInfo()
//   // return ftx_exchange.loadMarkets()
// }

//獲取交易對數據
export const getTicker = (symbol) => {
  if (!symbol) return
  // return binance_exchange.fapiPublicGetTickerPrice({"symbol": symbol}) //這隻的symbol不用slash(/)
  return binance_exchange.fetch_ticker(symbol) // 這隻要slash
}

export const getIncome = () => {
  return binance_exchange.fapiPrivateGetIncome()
}

//查詢餘額
export const getBalance = () => {
  return binance_exchange.fapiPrivateV2GetBalance()
}

//查詢現在合約倉位資訊
//binance 的fapiPrivateGetAccount裡面有position資訊
export const getPosition = () => {
  return binance_exchange.fetch_positions()
}

//取得帳戶資訊,裡面有很多資料
export const getAccount = () => {
  // return binance_exchange.fapiPrivate_get_account()
  return binance_exchange.fapiPrivateGetAccount()
}

//改變槓桿值
export const changeLeverage = (userSymbol, userLeverage) => {
  return binance_exchange.fapiPrivatePostLeverage({
            symbol: userSymbol,
            leverage: userLeverage,
          })
}

//市價買賣單
//amount 開的數量
//(保證金*槓桿 )/ 現在的幣價  = 最大可開的數量，最大可開數量 乘上 你要的開倉輸入的%數 就是開倉數量(amount)
export const marketOrder = (symbol, side, amount) => {
  return binance_exchange.createOrder(symbol, 'market', side, amount)
  // binance_exchange.fapiPrivatePostOrder({
  //   "symbol":"BTCUSDT",
  //   "side":"BUY",
  //   "type":"MARKET",
  //   "quantity":"0.0003",
  //   "timestamp": "1623063206357"
  // })
}

export const marketStopLoss = async (symbol, side, amount, stopPrice) => {
  // console.log("pppp",stopPrice)
  // return binance_exchange.createOrder({
  //     symbol:'DOGEUSDT', 
  //     type:"STOP_MARKET", 
  //     side:side, 
  //     amount:amount,
  //     // price: none,
  //     //params, stopPrice:觸發價格
  //     params:{'stopPrice': 0.27375}
  //   })
  // let params = {
  //   'stopPrice': 0.27375, // your stop price
  // }
  return binance_exchange.createOrder(
    symbol, 
    "STOP_MARKET",
    side, 
    amount,
    //params, stopPrice:觸發價格
    {
      'stopPrice': 0.27375, // your stop price
    }
  )

}

export const trailingStop = (symbol, side, amount, price, stopPrice, callbackRate) => {
  return binance_exchange.createOrder(
      symbol, 
      'TRAILING_STOP_MARKET', 
      side, 
      amount, 
      price, 
      //params, stopPrice:觸發價格, callbackRate:回調率
      // params= {
      //   'stopPrice': stopPrice,
      //   'callbackRate': callbackRate
      //   }
    )
}

//取得交易資料
export const getTrades = () => {
  // return binance_exchange.fapiPrivate_get_account()
  return binance_exchange.fapiPrivateGetUserTrades()
}
