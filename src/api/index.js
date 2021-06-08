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

export const getMarkets = () => {
  return binance_exchange.fapiPublicGetExchangeInfo()
  // return ftx_exchange.loadMarkets()
}

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
  binance_exchange.fapiPrivatePostLeverage({
    symbol: userSymbol,
    leverage: userLeverage,
  })
}

//市價買賣單
//amount 開的數量
//(保證金*槓桿 )/ 現在的幣價  = 最大可開的數量，最大可開數量 乘上 你要的開倉輸入的%數 就是開倉數量(amount)
export const marketOrder = (symbol, side, amount) => {
  binance_exchange.createOrder(symbol, 'market', side, amount)
  // binance_exchange.fapiPrivatePostOrder({
  //   "symbol":"BTCUSDT",
  //   "side":"BUY",
  //   "type":"MARKET",
  //   "quantity":"0.0003",
  //   "timestamp": "1623063206357"
  // })
}

//取得交易資料
export const getTrades = () => {
  // return binance_exchange.fapiPrivate_get_account()
  return binance_exchange.fapiPrivateGetUserTrades()
}
