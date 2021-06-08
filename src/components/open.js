import React, { useEffect, useState, useContext } from 'react'
import { InputTextField } from '../styles'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import { getBalance, marketOrder } from '../api'
import _ from 'lodash'
import { GlobalContext } from '../context'
import Decimal from 'decimal.js'
import bigInt from 'big-integer'
const Open = () => {
  const [time, setTime] = useState()
  const [side, setSide] = useState('buy')
  const [inputValue, setInpuValue] = useState('')
  const [balance, setBalance] = useState({})
  const [availableBalance, setAvailableBalance] = useState(0)
  const [leverage, setLeverage] = useState(1)
  const [global] = useContext(GlobalContext)
  const [price, setPrice] = useState(0)
  const [symbol, setSymbol] = useState('')
 

  
  useEffect(() => {
    const getBalanceData = async () => {
      const balanceData = await getBalance()
      setBalance(balanceData)
      //取得可用資金
      console.log("balance",Object.values(balanceData).filter((item)=>item.asset==='USDT').map((b)=> parseFloat(b.availableBalance)))
      setAvailableBalance(parseFloat(Object.values(balanceData).filter((item)=>item.asset==='USDT').map((b)=> b.availableBalance)))
    }
    getBalanceData()
  }, [])
  // console.log('balance:',balance)
  // console.log(availableBalance)
  // console.log("glo:",global)


  //取得槓桿
  useEffect(() => {
    setPrice(global.price)
    setLeverage(global.leverage)
    setSymbol(global.symbol)
    setTime(global.time)
  }, [global])

  const handleChangeSelect = (event) => {
    setSide(event.target.value)
  }
  const handleChangeInput = (event) => {
    setInpuValue(event.target.value)
  }

  //(可用保證金*槓桿 )/ 現在的幣價  = 最大可開的數量，最大可開數量 乘上 你要的開倉輸入的%數 就是開倉數量(amount)
  // const countAmount = () => {
  //   //拿計算後和
  //   let num = ((freeCollateral * leverage) / price) * (inputValue / 100)
  //   setAmount(num)
  // }

  const handleButtonClick = () => {
    //以下註解 console勿刪
    console.log("symbol:",symbol,
    '多空:', side, 
    '幾趴:', inputValue ,
    "買入數量:",parseFloat(Math.floor(((availableBalance * leverage) / price) * (inputValue / 100) * 1000) / 1000),
    "availableBalance",availableBalance,"leverage",leverage,"price",price,"inputValue",inputValue)
    // console.log(parseFloat((Math.floor(((availableBalance * leverage) / price) * (inputValue / 100) * 10000) / 10000)))
    // console.log(((Math.floor(((availableBalance * leverage) / price) * (inputValue / 100) * 10000) / 10000)).toPrecision(8))
    // console.log(Decimal(((availableBalance * leverage) / price) * (inputValue / 100)).toFixed(4))
    console.log((parseFloat((Math.floor(((availableBalance * leverage) / price) * (inputValue / 100) * 1000) / 1000))))
    marketOrder(symbol, side, parseFloat(Math.floor(((availableBalance * leverage) / price) * (inputValue / 100) * 1000) / 1000))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">開倉參數:</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">
          <span className="mr-5">多空倉切換:</span>
          <span>{side}</span>
          <div>
            <FormControl component="fieldset">
              <FormLabel component="legend"></FormLabel>
              <RadioGroup
                row
                defaultValue="buy"
                aria-label="多空"
                name="longOrShort"
                value={side}
                onChange={handleChangeSelect}
              >
                <FormControlLabel value="buy" control={<Radio />} label="buy" />
                <FormControlLabel value="sell" control={<Radio />} label="sell" />
              </RadioGroup>
            </FormControl>
          </div>
        </span>
      </div>
      {/* <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">開倉時間:</span>
        <InputTextField label="time" variant="outlined" color="primary" size="small" />
      </div> */}
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">開倉數量:</span>
        {/* TODO:設定filter 1-100% */}
        <InputTextField
          label="開倉%數"
          variant="outlined"
          size="small"
          // value={inputValue}
          onChange={handleChangeInput}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
        {/* {console.log(inputValue)} */}
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">
          可買入數量:{((Math.floor(((availableBalance * leverage) / price) * (inputValue / 100) * 10000) / 10000))}
          </span>
        
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">
          實際買入數量:{parseFloat(Math.floor(((availableBalance * leverage) / price) * (inputValue / 100) * 1000) / 1000)}
          </span>
        
      </div>

      <div className="flex items-center">
        <Button onClick={handleButtonClick} size="small" variant="contained" color="primary">
          confirm
        </Button>
      </div>
    </div>
  )
}
export default Open
