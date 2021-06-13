import React, { useState, useEffect, useContext } from 'react'
import Button from '@material-ui/core/Button'
import { GlobalContext } from '../context'
import { InputTextField } from '../styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import { marketOrder, marketStopLoss, trailingStop } from '../api'
import _, { set } from 'lodash'

const Close = () => {
  const [global] = useContext(GlobalContext)
  const [position, setPosition] = useState()
  const [inputValueSellAll, setInputValueSellAll] = useState()
  const [inputValueStopLoss, setInputValueStopLoss] = useState(0)
  const [leverage, setLeverage] = useState(0)
  const [symbol, setSymbol] = useState('')
  const [minQty, setMinQty] = useState(0)
  const [price, setPrice] = useState(0)
  const [minTickerSize, setMinTickerSize] = useState(0)

  //初始化拿position
  useEffect(() => {
    // setPosition(_.get(global, 'position', 0))
    setLeverage(global.leverage)
    setMinTickerSize(global.minTickerSize)
    setPrice(global.price)
    setPosition(global.position)
    setSymbol(global.symbol)
    setMinQty(global.minQty)
  }, [global])
  console.log("close:",global)

  //一鍵平倉 func 優化:運算可以拿去period
  const sellAll = () => {
    Object.values(position)
      .filter((item) => Math.abs(item.positionAmt)> 0)
      .map((p) => {
        console.log(symbol, 'old', p.positionAmt, Math.abs(p.positionAmt))
        let side = ''
        //倉位數量大於0，一鍵平倉side則設為sell，反之則相反
        if (p.positionAmt > 0 ) {
          side = 'sell'
        }
        if (p.positionAmt < 0) {
          side = 'buy'
        }
        marketOrder(symbol, side, Math.floor(  Math.abs(p.positionAmt) * (inputValueSellAll / 100) / minQty ) * minQty)
      })
  }

  const stopLoss = () => {
    Object.values(position)
      .filter((item) => Math.abs(item.positionAmt)> 0)
      .map((p) => {
        let side = ''
        //倉位數量大於0,止損side則設為sell，反之則相反
        if (p.positionAmt > 0 ) {
          side = 'sell'
        }
        if (p.positionAmt < 0) {
          side = 'buy'
        }

        let stopPrice = 0
        if (side==="sell"){
          stopPrice = parseFloat((((100-parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price).toFixed((minTickerSize.toString().length)-2))
        }
        if (side==="buy"){
          stopPrice = parseFloat((((100+parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price).toFixed((minTickerSize.toString().length)-2))
          // stopPrice = (Math.floor((((100+parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price)/minTickerSize)*minTickerSize)
        }
        console.log((inputValueStopLoss/leverage),stopPrice)
        console.log("symbol:", symbol, "side:", side, "amount:", Math.abs(p.positionAmt), "stopPrice:", stopPrice)
        // marketStopLoss(symbol, side, Math.abs(p.positionAmt), stopPrice)
      })

  }

  const handleChangeInputSellAll = (event) => {
    setInputValueSellAll(event.target.value)
  }

  const handleChangeInputStopLoss = (event) => {
    setInputValueStopLoss(parseInt(event.target.value))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">止盈/止損參數:</span>
      </div>
      <div className="flex items-center">
        {/* <span className="text-white text-lg mr-5 font-bold">止損價格(持多倉/持空倉):
        {parseFloat((((100-parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price).toFixed((minTickerSize.toString().length)-2))}
        /
        {parseFloat((((100+parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price).toFixed((minTickerSize.toString().length)-2))}
        </span> */}
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">止損%數:</span>
        <InputTextField
          label="止損%數"
          variant="outlined"
          color="primary"
          size="small"
          onChange={handleChangeInputStopLoss}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </div>
      <div className="flex items-center">
      {
       symbol?
        <Button onClick={stopLoss} size="small" variant="contained" color="primary">
          confirm
        </Button>
        :
        <Button disabled onClick={stopLoss} size="small" variant="contained" color="primary">
          confirm
        </Button>
      }
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">追蹤止盈%數:</span>
        <InputTextField
          label="目標%數"
          variant="outlined"
          color="primary"
          size="small"
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
        <InputTextField
          label="追蹤%數"
          variant="outlined"
          color="primary"
          size="small"
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </div>
      <div className="flex items-center">
        <Button
          onClick={() => {
            alert('comfirm 平倉參數')
          }}
          size="small"
          variant="contained"
          color="primary"
        >
          confirm
        </Button>
      </div>

      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">平倉參數:</span>
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">手動平倉%數:</span>
        <InputTextField
          label="平倉%數"
          variant="outlined"
          color="primary"
          size="small"
          onChange={handleChangeInputSellAll}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </div>
      <div className="flex items-center">

       {
       symbol?
       <Button onClick={sellAll} size="small" variant="contained" color="primary">
          confirm
        </Button>
        :
        <Button disabled onClick={sellAll} size="small" variant="contained" color="primary">
          confirm
        </Button>
        }
      </div>
    </div>
  )
}
export default Close

// 這<<<止損觸發價>>>的邏輯跟你確定一下，觸發之後會用市價賣出
// 持多倉：
// (Math.floor((((100-parseInt((inputValueStopLoss/leverage).toFixed(2)))/100)*price)/minTickerSize)*minTickerSize).toFixed(2)
// 人話：{[100-(輸入止損%數/開的槓桿倍數)取小數點後兩位四捨五入]/100}*現價
// 持空倉：
// (Math.floor((((100+parseInt((inputValueStopLoss/leverage).toFixed(2)))/100)*price)/minTickerSize)*minTickerSize).toFixed(2)
// 人話：{[100+(輸入止損%數/開的槓桿倍數)取小數點後兩位四捨五入]/100}*現價