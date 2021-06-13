import React, { useState, useEffect, useContext, useCallback } from 'react'
import './App.css'
import { getMarkets, getTicker, getAccount, getServerTime, getAllImplicitApiMethods, changeLeverage } from './api'
import { useSelectStyles } from './styles'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import moment from 'moment'
import Open from './components/open'
import Close from './components/close'
import User from './components/user'
import UserInfo from './components/userInfo'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import _ from 'lodash'
import { GlobalContext } from './context'
import { LEVERAGEMARKS } from './constants'
import Period from './components/period'

function App() {
  const [markets, setMarkets] = useState({}) // 市場上所有的幣別
  const [symbol, setSymbol] = useState('') // symbol代表幣別 e.g. ETH/BTC, LTC/BTC
  const [slideValue, setSlideValue] = useState(1)
  const [position, setPosition] = useState({})
  const [global, setGlobal] = useContext(GlobalContext)
  const time = symbol ? _.get(global, 'time', '') : '' // 獲取時間 (如果沒選幣別,不顯示時間)
  const [price, setPrice] = useState(0)
  const [minQty, setMinQty] = useState(0)
  const [minTickerSize, setMinTickerSize] = useState(0)
  // console.log(getAllImplicitApiMethods())

  // 初始化拿到市場資料
  useEffect(() => {
    const init = async () => {
      const ccxtMarket = await getMarkets()
      const timeData = await getServerTime()
      const accountData = await getAccount()

      setMinQty(ccxtMarket.filter((item)=>item.symbol===symbol).map((i)=> i.limits.amount.min))
      setMinTickerSize(parseFloat(ccxtMarket.filter((item)=>item.symbol===symbol).map((i)=> Object.values(i.info.filters).filter((j)=>j.filterType==="PRICE_FILTER").map((k)=>k.tickSize))))
      // console.log("gettt",parseFloat(ccxtMarket.filter((item)=>item.symbol===symbol).map((i)=> Object.values(i.info.filters).filter((j)=>j.filterType==="PRICE_FILTER").map((k)=>k.tickSize))))
      setMarkets(ccxtMarket.map((item)=>item.symbol))      
      setPosition(Object.values(accountData.positions).filter((item) => Math.abs(item.positionAmt) > 0))
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
          leverage: parseInt(
            Object.values(accountData.positions)
              .filter((item) => item.symbol === symbol?.replace('/', ''))
              .map((l) => l.leverage)
          ),
          position: 
            Object.values(accountData.positions)
              .filter((item) => ( Math.abs(item.positionAmt) > 0 ) //絕對值
          ) ,
          time: timeData['serverTime'],
          //parseFloat 把陣列變成一個float值
          minQty: parseFloat(Object.values(ccxtMarket).filter((item)=>item.symbol===symbol).map((i)=>  i.limits.amount.min)),
          minTickerSize: parseFloat(ccxtMarket.filter((item)=>item.symbol===symbol).map((i)=> Object.values(i.info.filters).filter((j)=>j.filterType==="PRICE_FILTER").map((k)=>k.tickSize)))
        }
      })
    }

    init()

  }, [symbol])  //換symbol時,要更新leverage,更新MinQty
  // console.log("AppGlo:",global)
  // 當幣別symbol改變時,拿幣的ticker,更新幣價
  useEffect(() => {
    const getTickerData = async () => {
      const tickerData = await getTicker(symbol)
      setPrice(tickerData?.last)
      setGlobal((prev) => {
        return { ...prev, price: tickerData?.last }
      })
    }
    getTickerData()
  }, [time, symbol, setGlobal])


  //調整槓桿倍率
  const handleChangeSlide = (event, newValue) => {
    setSlideValue(newValue)
    setGlobal((prev) => {
      return { ...prev, leverage: newValue }
    })
    // 此comment勿刪除 之後會要用
    changeLeverage(symbol.replace('/', ''), newValue)
  }

  // //選幣別時,把選項存起來,底線是他會傳兩個參數,可是只用的到第二個,第一格就可以放底線
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

        {/* <UserInfo /> */}

        {/* 定時Call API */}
        <Period />
      </div>
    </div>
  )
}

export default App
