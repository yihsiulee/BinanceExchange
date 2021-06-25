import React, { useEffect, useState, useContext } from 'react'
import { InputTextField } from '../styles'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import { getBalance, openMarketOrder } from '../api'
import { GlobalContext } from '../context'
import _ from 'lodash'
import { promisify } from 'util'


const Open = () => {
  const [side, setSide] = useState('buy')
  const [inputValue, setInpuValue] = useState('')
  const [availableBalance, setAvailableBalance] = useState(0)
  const [leverage, setLeverage] = useState(1)
  const [global] = useContext(GlobalContext)
  const [price, setPrice] = useState(0)
  const [symbol, setSymbol] = useState('')
  const [minQty, setMinQty] = useState(0)
  const firstUserExchange = _.get(global, 'users[0].exchange', null)



  //取得槓桿
  useEffect(() => {
    // setAvailableBalance(global.availableBalance)
    setMinQty(global.minQty)
    setPrice(global.price)
    setLeverage(global.leverage)
    setSymbol(global.symbol)
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

  const handleButtonClick = async () => {
    const regex = new RegExp("^[1-9][0-9]?$|^100$");
    if (!regex.test(inputValue)) {
      alert("請輸入0到100的數字")
      return
    }
    var message = ""

    //以下註解 console勿刪
    if (!global.users) return
    for (let user of global.users) {
      console.log(
        'symbol:',
        symbol,
        '多空:',
        side,
        '幾趴:',
        inputValue,
        '買入數量:',
        parseFloat(Math.floor((((user.availableBalance * leverage) / price) * (inputValue / 100)) / minQty) * minQty),
        'availableBalance',
        user.availableBalance,
        'leverage',
        leverage,
        'price',
        price,
        "user.exchange",
        user.exchange
      )
      await openMarketOrder(
        user.exchange,
        symbol,
        side,
        parseFloat(Math.floor((((user.availableBalance * leverage) / price) * (inputValue / 100)) / minQty) * minQty)
      ).then((result) => {
        message = message + "user: " + user.id + " 買入成功: " + symbol + ", 數量: " + result.amount + "\n"
      }).catch((e) => {
        message = message + "user: " + user.id + " 買入失敗： " + e + "\n"
      })
    }
    alert(message)



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
        {/* <span className="text-white text-lg mr-5 font-bold">
          可買入數量:{((availableBalance * leverage) / price) * (inputValue / 100)}
        </span> */}

        <span className="text-white text-lg mr-5 font-bold">最低買入單位:{minQty ? minQty : 0}</span>
      </div>

      {/* <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">
          實際買入數量:
          {parseFloat(Math.floor((((availableBalance * leverage) / price) * (inputValue / 100)) / minQty) * minQty)}
        </span>
      </div> */}

      <div className="flex items-center">
        <Button onClick={handleButtonClick} size="small" variant="contained" color="primary">
          confirm
        </Button>
      </div>
    </div>
  )
}
export default Open
