import React, { useState, useEffect, useContext } from 'react'
import './App.css'
// import { REACT_APP_USER1_APIKEY, REACT_APP_USER1_SECRET } from './config'
import { getMarkets, getTicker, getAccount } from './api'
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

function App() {
  const [markets, setMarkets] = useState({}) //市場上所有的幣別
  const [symbol, setSymbol] = useState('') // symbol代表幣別 e.g. ETH/BTC, LTC/BTC
  const [ticker, setTicker] = useState({})
  const [slideValue, setSlideValue] = useState(1)
  const [account, setAccount] = useState({})
  const [global, setGlobal] = useContext(GlobalContext)
  const [price, setPrice] = useState(0)
  // console.log('global:', global)

  const leverageMarks = [
    {
      value: 1,
      label: '1x',
    },
    {
      value: 3,
      label: '3x',
    },
    {
      value: 5,
      label: '5x',
    },
    {
      value: 10,
      label: '10x',
    },
    {
      value: 20,
      label: '20x',
    },
    {
      value: 50,
      label: '50x',
    },
    {
      value: 100,
      label: '100x',
    },
    {
      value: 101,
      label: '101x',
    },
  ]
  // 初始化拿到市場資料
  useEffect(() => {
    const init = async () => {
      const marketsData = await getMarkets()

      var filteredObject = Object.keys(marketsData).reduce(function (r, e) {
        if (marketsData[e].id.slice(-4) === 'PERP') r[e] = marketsData[e]
        return r
      }, {})

      setMarkets(filteredObject)
      //    setMarkets(marketsData)
      const accountData = await getAccount()
      setAccount(accountData)
    }
    init()
  }, [])

  // 當幣別symbol改變時,拿幣的ticker
  useEffect(() => {
    const getTickerData = async () => {
      const tickerData = await getTicker(symbol)
      setGlobal((prev) => {
        return { ...prev, symbol }
      })
      setTicker(tickerData)
    }
    getTickerData()
  }, [symbol])

  //  更新幣價
  useEffect(() => {
    setPrice(ticker?.last)
    setGlobal((prev) => {
      return { ...prev, price: ticker?.last }
    })
  }, [ticker])

  //更新槓桿倍率
  useEffect(() => {
    let leverage = _.get(account, 'result.leverage', 1)
    setSlideValue(parseInt(leverage))
    setGlobal((prev) => {
      return { ...prev, leverage: parseInt(leverage) }
    })
  }, [account])

  //調整槓桿倍率
  const handleChangeSlide = (event, newValue) => {
    setSlideValue(newValue)
    setGlobal((prev) => {
      return { ...prev, leverage: newValue }
    })
    // 此comment勿刪除 之後會要用
    // changeLeverage(newValue)
  }

  //選幣別時,把選項存起來,底線是他會傳兩個參數,可是只用的到第二個,第一格就可以放底線
  const handleChangeSymbol = (_, value) => {
    setSymbol(value?.id)
  }
  return (
    <div className="h-full w-full flex  bg-darkblue">
      <div className="w-1/2  justify-items-center rounded-xl p-4 space-y-2 m-auto bg-lightblue">
        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">獲取時間:</span>
          <span className="text-white">{moment(parseInt(ticker?.timestamp)).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>

        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">幣別:</span>
          <Autocomplete
            options={Object.keys(markets).map((key) => {
              return { id: key, ...markets[key] }
            })}
            classes={useSelectStyles()}
            getOptionLabel={(option) => option.id}
            getOptionSelected={(option, value) => option.id === value.id}
            style={{ width: 300 }}
            renderInput={(params) => <TextField {...params} variant="outlined" size="small" />}
            onChange={handleChangeSymbol} //改變時call
          />
        </div>

        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">幣價:</span>
          <span className="text-white">{price}</span>
        </div>

        <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">
            <div className="flex items-center">
              <span className="mr-5">槓桿倍數:</span>
              <Typography id="discrete-slider-custom">{`leverage: ${slideValue}x`}</Typography>
            </div>
            <div>
              <Slider
                style={{ width: 400 }}
                value={slideValue}
                onChange={handleChangeSlide}
                aria-labelledby="discrete-slider-custom"
                step={null}
                valueLabelDisplay="auto"
                marks={leverageMarks}
                min={1}
                max={101}
              />
            </div>
          </span>
        </div>

        {/* 開倉參數 */}
        <Open />

        {/* 平倉參數 */}
        <Close />

        {/* user顯示 */}
        <User />


        <UserInfo/>
      </div>
    </div>
  )
}

export default App
