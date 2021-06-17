import React, { useState, useEffect, useContext } from 'react'
import Button from '@material-ui/core/Button'
import { GlobalContext } from '../context'
import { InputTextField } from '../styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import { closeMarketOrder, marketStopLoss, cancelAllOrder, trailingStop, getAccount} from '../api'
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
  const firstUserExchange = _.get(global, 'users[0].exchange', null)
  const [time, setTime] = useState(0)
  const [activationPercentage, setActivationPercentage] = useState(0)
  const [callbackRate, setCallbackRate] = useState(0)
  const [repeatPercentage, setRepeatPercentage] = useState(0)
  const [repeatPrice, setRepeatPrice] = useState(0)
  const [repeatSide, setRepeatSide] = useState('')
  const [repeatSymbol, setRepeatSymbol] = useState('')
  //初始化拿position
  useEffect(() => {
    // setPosition(_.get(global, 'position', 0))
    setTime(global.time)
    setLeverage(global.leverage)
    setMinTickerSize(global.minTickerSize)
    setPrice(global.price)
    setPosition(global.position)
    setSymbol(global.symbol)
    setMinQty(global.minQty)
    // repeatSell()
  }, [global])

  useEffect(() => {
    repeatSell()
  }, [time])
  // console.log("close:",global)



  //一鍵市價平倉 func 優化:運算可以拿去period?
  const sellAllOrder = () => {
     Object.values(position)
      .filter((item) => Math.abs(item.positionAmt) > 0)
      .map((p) => {
        console.log(symbol, 'old', p.positionAmt, Math.abs(p.positionAmt))
        let side = ''
        //倉位數量大於0，一鍵平倉side則設為sell，反之則相反
        if (p.positionAmt > 0) {
          side = 'sell'
        }
        if (p.positionAmt < 0) {
          side = 'buy'
        }
        closeMarketOrder(
          firstUserExchange,
          symbol,
          side,
          Math.floor((Math.abs(p.positionAmt) * (inputValueSellAll / 100)) / minQty) * minQty
        )
        return true
      })
  }
  //市價止損單
  const stopLossOrder = () => {
    Object.values(position)
      .filter((item) => Math.abs(item.positionAmt) > 0)
      .map((p) => {
        let side = ''
        //倉位數量大於0,止損side則設為sell，反之則相反
        if (p.positionAmt > 0) {
          side = 'sell'
        }
        if (p.positionAmt < 0) {
          side = 'buy'
        }

        let stopPrice = 0
        if (side === 'sell') {
          stopPrice = parseFloat(
            (((100 - parseFloat((inputValueStopLoss / leverage).toFixed(2))) / 100) * price).toFixed(
              minTickerSize.toString().length - 2
            )
          )
        }
        if (side === 'buy') {
          stopPrice = parseFloat(
            (((100 + parseFloat((inputValueStopLoss / leverage).toFixed(2))) / 100) * price).toFixed(
              minTickerSize.toString().length - 2
            )
          )
          // stopPrice = (Math.floor((((100+parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price)/minTickerSize)*minTickerSize)
        }
        console.log(inputValueStopLoss / leverage, stopPrice)
        console.log('symbol:', symbol, 'side:', side, 'amount:', Math.abs(p.positionAmt), 'stopPrice:', stopPrice)
        marketStopLoss(firstUserExchange, symbol, side, Math.abs(p.positionAmt), stopPrice)
        return true
      })
  }

  //追蹤止盈單
  const trailingOrder = () => {
    Object.values(position)
      .filter((item) => Math.abs(item.positionAmt) > 0)
      .map((p) => {
        let side = ''
        //倉位數量大於0,止損side則設為sell，反之則相反
        if (p.positionAmt > 0) {
          side = 'sell'
        }
        if (p.positionAmt < 0) {
          side = 'buy'
        }

        let activationPrice = 0
        if (side === 'sell') {
          activationPrice = parseFloat(
            (((100 + parseFloat((activationPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              minTickerSize.toString().length - 2
            )
          )
        }
        if (side === 'buy') {
          activationPrice = parseFloat(
            (((100 - parseFloat((activationPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              minTickerSize.toString().length - 2
            )
          )
        }
        console.log('symbol:', symbol, 'side:', side, 'amount:', Math.abs(p.positionAmt), 'activationPrice:', activationPrice, "callbackRate:", callbackRate)
        trailingStop(firstUserExchange, symbol, side, Math.abs(p.positionAmt), activationPrice, callbackRate)
        return true
      })
  }

  //設定重複賣出參數
  const onClickSetRepeatParams = () => {
    Object.values(position)
      .filter((item) => Math.abs(item.positionAmt) > 0)
      .map((p) => {
        let side = ''
        //倉位數量大於0,止損side則設為sell，反之則相反
        if (p.positionAmt > 0) {
          side = 'sell'
        }
        if (p.positionAmt < 0) {
          side = 'buy'
        }
        let stopPrice = 0
        if (side === 'sell') {
          stopPrice = parseFloat(
            (((100 - parseFloat((repeatPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              minTickerSize.toString().length - 2
            )
          )
        }
        if (side === 'buy') {
          stopPrice = parseFloat(
            (((100 + parseFloat((repeatPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              minTickerSize.toString().length - 2
            )
          )
        }
        setRepeatSymbol(p.symbol)
        setRepeatSide(side)
        setRepeatPrice(stopPrice)
        return true
      })
  }


  //重複比對是否要賣出
  const repeatSell = () => {
    if(position!==undefined){
      let positionAmount = 0
      // let positionSymbol = ''
      Object.values(position)
        .filter((item) => Math.abs(item.positionAmt) > 0)
        .map((p) => { 
            positionAmount = parseFloat(p.positionAmt)
            // positionSymbol = p.symbol
          }
        )
    //持多倉狀況
      if(repeatSymbol===symbol && repeatSide === "sell" && repeatPrice > price){
            //有"只平倉"參數
            closeMarketOrder(
              firstUserExchange,
              symbol,
              repeatSide,
              positionAmount
              )
            console.log("多單止損rrr")
            if(positionAmount==0){
              setRepeatSymbol('')
              setRepeatSide('')
              setRepeatPrice(0)
            }
          }
      //持空倉狀況
      else if(repeatSymbol===symbol && repeatSide === "buy" && repeatPrice < price){
            //有"只平倉"參數
            closeMarketOrder(
              firstUserExchange,
              symbol,
              repeatSide,
              positionAmount
            )
            if(positionAmount==0){
              setRepeatSymbol('')
              setRepeatSide('')
              setRepeatPrice(0)
            }
            console.log("空單止損rrr")
      }
      else{
        // console.log("nothing happend")
      }
    }
  }

  const resetRepeat = () => {
    setRepeatPrice(0)
    setRepeatSide('')
    setRepeatSymbol('')
  }

  //not okay
  const cancelOrder = () =>{
    cancelAllOrder(symbol,time)
  }

  const handleChangeInputSellAll = (event) => {
    setInputValueSellAll(event.target.value)
  }

  const handleChangeInputStopLoss = (event) => {
    setInputValueStopLoss(parseInt(event.target.value))
  }

  const handleChangeInputAcPercentage = (event) => {
    setActivationPercentage(parseInt(event.target.value))
  }

  const handleChangeInputCallbackRate = (event) => {
    setCallbackRate(parseInt(event.target.value))
  }

  const handleChangeInputReapeat = (event) => {
    setRepeatPercentage(parseInt(event.target.value))
  }

  

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">市價止損掛單參數:(以下皆用市價算%數)</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">觸發止損價格(持多倉/持空倉):
        
        {parseFloat((((100-parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length-2))}
        /
        {parseFloat((((100+parseFloat((inputValueStopLoss/leverage).toFixed(2)))/100)*price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length-2))}
        </span>
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
        {symbol ? (
          <Button onClick={stopLossOrder} size="small" variant="contained" color="primary">
            confirm
          </Button>
        ) : (
          <Button disabled onClick={stopLossOrder} size="small" variant="contained" color="primary">
            confirm
          </Button>
        )}
      </div>

      {/* 重複止損 */}
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">重複止損直到平倉:</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">
          (限定與選擇單一貨幣，低於市價自動平倉直到倉位歸0)
          </span>
      </div>
      <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">
          當前設定幣種:{repeatSymbol}
          </span>
      </div>
      <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">
          當前設定價格:{repeatPrice}
          </span>
      </div>
      <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">
          觸發時開倉方向(與持倉相反):{repeatSide}
          </span>
      </div>
      <div className="flex items-center">
          <span className="text-white text-lg mr-5 font-bold">
          觸發價格(持多倉/持空倉):
          {parseFloat((((100-parseFloat((repeatPercentage/leverage).toFixed(2)))/100)*price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length-2))}
          /
          {parseFloat((((100+parseFloat((repeatPercentage/leverage).toFixed(2)))/100)*price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length-2))}
          </span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">設定%數:{repeatPercentage}</span>
        <InputTextField
          label="止損%數"
          variant="outlined"
          color="primary"
          size="small"
          onChange={handleChangeInputReapeat}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5">
          {symbol ? (
            <Button onClick={onClickSetRepeatParams} size="small" variant="contained" color="primary">
              設定觸發價格
            </Button>
          ) : (
            <Button disabled onClick={onClickSetRepeatParams} size="small" variant="contained" color="primary">
              設定觸發價格
            </Button>
          )}
        </span>

        <span className="text-white text-lg mr-5">
          {symbol ? (
            <Button onClick={resetRepeat} size="small" variant="contained" color="primary">
              取消
            </Button>
          ) : (
            <Button disabled onClick={resetRepeat} size="small" variant="contained" color="primary">
              取消
            </Button>
          )}
        </span>
      </div>

      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">追蹤止盈掛單:</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">目標價格(持多倉/持空倉):
        {parseFloat(
            (((100 + parseFloat((activationPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              !minTickerSize ? 0 : minTickerSize.toString().length-2
            )
          )}
        /
        {parseFloat(
            (((100 - parseFloat((activationPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              !minTickerSize ? 0 : minTickerSize.toString().length-2
            )
          )}
        </span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">目標%數:{activationPercentage}</span>
        <InputTextField
          label="目標%數"
          variant="outlined"
          color="primary"
          size="small"
          onChange={handleChangeInputAcPercentage}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">追蹤%數(輸入0.1%-5%):{callbackRate}</span>
        <InputTextField
          label="追蹤%數"
          variant="outlined"
          color="primary"
          size="small"
          onChange={handleChangeInputCallbackRate}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </div>

      <div className="flex items-center">
      {symbol ? (
        <Button onClick={trailingOrder} size="small" variant="contained" color="primary">
          確認追蹤止盈
        </Button>
        ) : (
        <Button disabled onClick={trailingOrder} size="small" variant="contained" color="primary">
          確認追蹤止盈
        </Button>
        )}
      </div>

      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">(還不能用)一鍵取消所有委託單:</span>
      </div>
      <div className="flex items-center">
        {symbol ? (
          <Button onClick={cancelOrder} size="small" variant="contained" color="primary">
            confirm
          </Button>
        ) : (
          <Button disabled onClick={cancelOrder} size="small" variant="contained" color="primary">
            confirm
          </Button>
        )}
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
        {symbol ? (
          <Button onClick={sellAllOrder} size="small" variant="contained" color="primary">
            confirm
          </Button>
        ) : (
          <Button disabled onClick={sellAllOrder} size="small" variant="contained" color="primary">
            confirm
          </Button>
        )}
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
