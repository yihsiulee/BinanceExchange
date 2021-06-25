import React, { useState, useEffect, useContext } from 'react'
import './App.css'
import { getMarkets, getTicker, getBalance, getAccount, getServerTime, changeLeverage, initBinanceExchange, getWebSocketKey, keepAliveWS, getIncome } from './api'
import { useSelectStyles } from './styles'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import moment from 'moment'
import Open from './components/open'
import Close from './components/close'
// import User from './components/user'
import UserInfo from './components/userInfo'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import _ from 'lodash'
import { GlobalContext } from './context'
import { LEVERAGEMARKS } from './constants'
import Period from './components/period'
import {
  REACT_APP_USER1_APIKEY,
  REACT_APP_USER1_SECRET,
  REACT_APP_USER2_APIKEY,
  REACT_APP_USER2_SECRET,
} from './config'

function App() {
  const [markets, setMarkets] = useState({}) // 市場上所有的幣別
  const [symbol, setSymbol] = useState('') // symbol代表幣別 e.g. ETH/BTC, LTC/BTC
  const [slideValue, setSlideValue] = useState(1)
  const [, setPosition] = useState({})
  const [global, setGlobal] = useContext(GlobalContext)
  // const time = symbol ? _.get(global, 'time', '') : '' // 獲取時間 (如果沒選幣別,不顯示時間)
  const [wsKey, setWsKey] = useState(0)
  const [time, setTime] = useState(0)
  const [price, setPrice] = useState(0)
  const [, setMinQty] = useState(0)
  const [, setMinTickerSize] = useState(0)
  const firstUserExchange = _.get(global, 'users[0].exchange', null)


  const [allTicker, setAllTicker] = useState(0)
  const [accountEvent, setAccountEvent] = useState({})
  const users = [
    { id: 0, apiKey: REACT_APP_USER1_APIKEY, secret: REACT_APP_USER1_SECRET },
    // { id: 1, apiKey: REACT_APP_USER2_APIKEY, secret: REACT_APP_USER2_SECRET },
  ]

  // console.log("global",global)

  // 初始化使用者, 將每個使用者的apiKey,secret分別建立exchange再存到global
  useEffect(() => {
    const init = async () => {
      const key = await getWebSocketKey({ user: users[0] })
      setWsKey(key)
      const exchanges = await Promise.all(
        users.map(async (user) => {
          return { id: user.id, exchange: initBinanceExchange(user) }
        })
      )

      // 展延WS key
      const keepaliveWS = setInterval(() => {
        keepAliveWS({ user: users[0] })
        // 怕意外，每五十分鐘更新一次
      }, 3000000)

      // 一個WS key最多展延到24小時，因此每天都要重新取得WS key
      const renew_ws_key = setInterval(() => {
        getWebSocketKey({ user: users[0] })
        // 怕意外，每23hr更新
      }, 82800000)


      setGlobal((prev) => {
        return { ...prev, users: exchanges }
      })
    }
    init()
  }, [])


  // fetch TICKER data by WebSocket
  // UI update while received data  
  //初始化
  useEffect(() => {
    const getWS = () => {
      const client = new WebSocket('wss://fstream.binance.com/ws/!ticker@arr');
      client.onmessage = (message) => {
        // var object = JSON.parse(message.data).filter((e)=> {return e.s ===  symbol?.replace('/', '')})

        // console.log(message.data)
        setAllTicker(JSON.parse(message.data))
        // setAllTicker(message.data)
      }
    }
    getWS()
  }, [])


  // UPDATE periodically 從all ticker資料拿出來篩
  useEffect(() => {
    const updateTickerInfo = () => {
      Object.values(allTicker).map((element) => {
        if (element.s === symbol?.replace('/', '')) {
          // "e": "24hrMiniTicker",  // 事件类型
          // "E": 123456789,         // 事件时间(毫秒)
          // "s": "BNBUSDT",         // 交易对
          // "c": "0.0025",          // 最新成交价格
          // "o": "0.0010",          // 24小时前开始第一笔成交价格
          // "h": "0.0025",          // 24小时内最高成交价
          // "l": "0.0010",          // 24小时内最低成交价
          // "v": "10000",           // 成交量
          // "q": "18"               // 成交额
          setPrice(parseFloat(element.c))
          setTime(element.E)
          setGlobal((prev) => {
            return {
              ...prev,
              price: parseFloat(element.c),
              time: element.E,
            }
          })
        }
      })
    }
    updateTickerInfo()
  }, [allTicker])

  // UPDATE account data periodically 
  // account data有變動時才會更新
  useEffect(() => {
    const updateAccountData = () => {
      const client = new WebSocket("wss://fstream.binance.com/ws/" + wsKey)
      client.onmessage = (message) => {

        //當作觸發其他useEffect的條件
        setAccountEvent(JSON.parse(message.data))
        setGlobal((prev) => {
          return { ...prev, accountEvent: JSON.parse(message.data) }
        })
        console.log("change response:", JSON.parse(message.data))
      }
    }
    updateAccountData()
  }, [wsKey])


  //更新條件：accountEven（有推送帳戶訊息時）,firstUserExchange 更新balance,position和account
  useEffect(() => {
    const getData = async (user) => {

      // 如果使用者是null時跳出
      if (!user.exchange) return
      const balanceData = await getBalance(user.exchange)
      const accountData = await getAccount(user.exchange)
      const incomeData = await getIncome(user.exchange)

      setPosition(Object.values(accountData.positions).filter((item) => Math.abs(item.positionAmt) > 0))
      setGlobal((prev) => {
        let newUserData = [...prev.users]
        // console.log("newUserDataqq",newUserData)

        newUserData[user.id].availableBalance = parseFloat(
          Object.values(balanceData)
            .filter((item) => item.asset === 'USDT')
            .map((b) => b?.availableBalance)
        )
        //計算獲利
        if (!incomeData) return
        var total_income_day = 0
        var total_income_week = 0
        Object.values(incomeData)
          .filter((element) => timeDifference(new Date().getTime(), element.time).daysDifference < 7) // 篩出與現在時間差距小於七天的交易
          .map((m) => {
            // 加總近7日獲利
            total_income_week += parseFloat(m.income)

            // 加總近24小時獲利
            if (timeDifference(new Date().getTime(), m.time).daysDifference < 1)
              total_income_day += parseFloat(m.income)
          })
        newUserData[user.id].account = accountData
        newUserData[user.id].position = Object.values(accountData.positions).filter(
          (item) => Math.abs(item.positionAmt) > 0 //絕對值
        )
        newUserData[user.id].profitDay = total_income_day.toFixed(5)
        newUserData[user.id].profitWeek = total_income_week.toFixed(5)
        // console.log("newUserData",newUserData)
        return {
          ...prev,
          users: newUserData,
          // availableBalance: parseFloat(
          // Object.values(balanceData)
          //   .filter((item) => item.asset === 'USDT')
          //   .map((b) => b?.availableBalance)
          //   ),
          // account: accountData,
          // position: Object.values(accountData.positions).filter(
          //   (item) => Math.abs(item.positionAmt) > 0 //絕對值
          //   ),
        }
      })

      console.log("balance", parseFloat(
        Object.values(balanceData)
          .filter((item) => item.asset === 'USDT')
          .map((b) => b?.availableBalance)
      ))

    }
    if (!global.users) return
    for (let user of global.users) {
      getData(user)
    }

  }, [accountEvent, firstUserExchange])

  // 換symbol時,要更新leverage,更新MinQty,MinTickerSize
  useEffect(() => {
    // 如果第一個使用者是null時跳出
    if (!firstUserExchange) return

    const init = async (user) => {
      //取得市場資料
      const ccxtMarket = await getMarkets(firstUserExchange)
      setMarkets(ccxtMarket.map((item) => item.symbol))
      setMinQty(ccxtMarket.filter((item) => item.symbol === symbol).map((i) => i.limits.amount.min))
      setMinTickerSize(
        parseFloat(
          ccxtMarket
            .filter((item) => item.symbol === symbol)
            .map((i) =>
              Object.values(i.info.filters)
                .filter((j) => j.filterType === 'PRICE_FILTER')
                .map((k) => k.tickSize)
            )
        )
      )

      //取得accountData內的slideValue 需有apiKey
      const accountData = await getAccount(firstUserExchange)
      setSlideValue(
        parseInt(
          Object.values(accountData.positions)
            .filter((item) => item.symbol === symbol?.replace('/', '')) //拿掉斜線 不用動
            .map((l) => l.leverage)
        )
      )

      setGlobal((prev) => {
        return {
          ...prev,
          //parseFloat 把陣列變成一個float值
          minQty: parseFloat(
            Object.values(ccxtMarket)
              .filter((item) => item.symbol === symbol)
              .map((i) => i.limits.amount.min)
          ),
          minTickerSize: parseFloat(
            ccxtMarket
              .filter((item) => item.symbol === symbol)
              .map((i) =>
                Object.values(i.info.filters)
                  .filter((j) => j.filterType === 'PRICE_FILTER')
                  .map((k) => k.tickSize)
              )
          ),
          leverage: parseInt(
            Object.values(accountData.positions)
              .filter((item) => item.symbol === symbol?.replace('/', ''))
              .map((l) => l.leverage)
          ),

        }
      })

    }

    init()


  }, [slideValue, symbol, firstUserExchange])


  //調整槓桿倍率
  const handleChangeSlide = (event, newValue) => {
    // 如果user exchange是null時跳出
    if (!firstUserExchange) return

    setSlideValue(newValue)
    setGlobal((prev) => {
      return { ...prev, leverage: newValue }
    })

    for (let user of global.users) {
      changeLeverage(user.exchange, symbol.replace('/', ''), newValue)

    }
  }

  // 選幣別時,把選項存起來,底線是他會傳兩個參數,可是只用的到第二個,第一格就可以放底線
  const handleChangeSymbol = (_, value) => {
    setSymbol(value?.id)
    setGlobal((prev) => {
      return { ...prev, symbol: value?.id }
    })
  }

  return (
    <div className="h-full w-full flex  bg-darkblue">
      <div className="justify-items-center rounded-xl p-4 space-y-2 m-auto bg-lightblue">
        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">以下資料以第一隻帳號為基準</span>
        </div>
        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">獲取時間:</span>
          <span className="text-white">{time ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
        </div>
        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">幣別:</span>
          <Autocomplete
            // options={Object.values(markets).map((key) => {
            //   const slashID = key['baseAsset'] + '/' + key['quoteAsset']
            //   return { id: slashID, key }
            // })}
            options={Object.values(markets).map((key) => {
              return { id: key, key }
            })}
            classes={useSelectStyles()}
            getOptionLabel={(option) => option.id}
            getOptionSelected={(option, value) => option.id === value.id}
            style={{ width: 300 }}
            renderInput={(params) => <TextField {...params} variant="outlined" size="small" />}
            onChange={handleChangeSymbol}
          />
        </div>

        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">幣價:</span>
          <span className="text-white">{price}</span>
        </div>

        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">
            <div className="flex items-center">
              <span className="mr-5">槓桿倍數(官方初始為20):</span>
              <Typography id="discrete-slider-custom">{`${slideValue ? slideValue : '請選擇幣別'}x`}</Typography>
            </div>
            {slideValue ? (
              <div>
                <Slider
                  style={{ width: 400 }}
                  value={slideValue}
                  onChange={handleChangeSlide}
                  aria-labelledby="discrete-slider-custom"
                  step={1}
                  valueLabelDisplay="auto"
                  marks={LEVERAGEMARKS}
                  min={1}
                  max={5}
                />
              </div>
            ) : (
              <div>
                <Slider
                  disabled
                  style={{ width: 400 }}
                  value={slideValue}
                  onChange={handleChangeSlide}
                  aria-labelledby="discrete-slider-custom"
                  step={1}
                  valueLabelDisplay="auto"
                  marks={LEVERAGEMARKS}
                  min={1}
                  max={5}
                />
              </div>
            )}
          </span>
        </div>

        {/* 開倉參數 */}
        <Open />

        {/* 止盈/止損參數, 平倉參數 */}
        <Close />

        {/* user顯示 */}
        {/* <User /> */}

        <UserInfo />

        {/* 定時Call API */}
        {/* <Period /> */}
      </div>
    </div>
  )
}
function timeDifference(date1, date2) {
  var difference = date1 - date2;

  var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  difference -= daysDifference * 1000 * 60 * 60 * 24

  var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
  difference -= hoursDifference * 1000 * 60 * 60

  var minutesDifference = Math.floor(difference / 1000 / 60);
  difference -= minutesDifference * 1000 * 60

  var secondsDifference = Math.floor(difference / 1000);

  return { daysDifference, hoursDifference }

  // console.log('difference = ' + 
  //   daysDifference + ' day/s ' + 
  //   hoursDifference + ' hour/s ' + 
  //   minutesDifference + ' minute/s ' + 
  //   secondsDifference + ' second/s ');
}
export default App
