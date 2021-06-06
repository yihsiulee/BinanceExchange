import ccxt from 'ccxt'
import { REACT_APP_USER1_APIKEY, REACT_APP_USER1_SECRET } from '../config'

const ftx_exchange = new ccxt.ftx({
  apiKey: REACT_APP_USER1_APIKEY,
  secret: REACT_APP_USER1_SECRET,
  timeout: 15000,
  enableRateLimit: true,
})

const binance_exchange = new ccxt.binance({
  apiKey: REACT_APP_USER1_APIKEY,
  secret: REACT_APP_USER1_SECRET,
  timeout: 15000,
  enableRateLimit: true,
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
  return ftx_exchange.id
}

export const getExchangeName = () => {
  return ftx_exchange.name
}

export const getExchangeTime = () => {
  return ftx_exchange.iso8601(ftx_exchange.milliseconds())
}

export const getMarkets = () => {
  return binance_exchange.fapiPublicGetExchangeInfo()
  // return ftx_exchange.loadMarkets()
}

//獲取交易對數據
export const getTicker = (symbol) => {
  if (!symbol) return
  return binance_exchange.fapiPublicGetTickerPrice({"symbol": symbol})
  // return binance_exchange.fetch_ticker("BTC/USDT") // 這隻也能用
}

//查詢餘額
export const getBalance = () => {
  return ftx_exchange.fetchBalance()
}

//查詢現在合約倉位資訊
export const getPosition = () => {
  return ftx_exchange.fetch_positions()
}

//取得帳戶資訊,裡面有很多資料
export const getAccount = () => {
  return binance_exchange.fapiPrivateGetAccount()
}

//改變槓桿值
export const changeLeverage = (userLeverage) => {
  ftx_exchange.private_post_account_leverage({
    leverage: userLeverage,
  })
}

//市價買賣單
//amount 開的數量
//(保證金*槓桿 )/ 現在的幣價  = 最大可開的數量，最大可開數量 乘上 你要的開倉輸入的%數 就是開倉數量(amount)
export const marketOrder = (symbol, side, amount) => {
  ftx_exchange.createOrder(symbol, 'market', side, amount)
}
