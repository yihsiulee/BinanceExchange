import React, { useState, useEffect, useContext } from 'react'
import Button from '@material-ui/core/Button'
import { GlobalContext } from '../context'
import { InputTextField } from '../styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import { closeMarketOrder, marketStopLoss, cancelOrder, trailingStop, getAccount, getAllOrder } from '../api'
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
  const ndUserExchange = _.get(global, 'users[1].exchange', null)

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
    // setPosition(global.position)//要改
    setSymbol(global.symbol)
    setMinQty(global.minQty)
  }, [global])

  useEffect(() => {
    //如果沒設定repeat價格就跳出
    if (parseFloat(repeatPrice) == 0) return
    repeatSell()
  }, [price])
  // console.log("close:",global)



  //一鍵市價平倉 func 
  const sellAllOrder = async () => {
    const regex = new RegExp("^[1-9][0-9]?$|^100$");
    if (!regex.test(inputValueSellAll)) {
      alert("請輸入1到100的數字")
      return
    }
    var message = ""
    if (!global.users) return

    for await (let [i, user] of global.users.entries()) {
      Object.values(user.position)
        .filter((item) => Math.abs(item.positionAmt) > 0)
        .map(async (p) => {
          console.log(symbol, 'old', p.positionAmt, Math.abs(p.positionAmt))

          let side = ''
          //倉位數量大於0，一鍵平倉side則設為sell，反之則相反
          if (p.positionAmt > 0) {
            side = 'sell'
          }
          if (p.positionAmt < 0) {
            side = 'buy'
          }
          await closeMarketOrder(
            user.exchange,
            symbol,
            side,
            Math.floor((Math.abs(p.positionAmt) * (inputValueSellAll / 100)) / minQty) * minQty
          ).then((result) => {
            message = message + "user: " + user.id + " 已平倉: " + symbol + ", 數量: " + result.amount + "\n"
          }).catch((e) => {
            message = message + "user: " + user.id + ", " + symbol + " 平倉失敗： " + e + "\n"
            // console.log(message)
          })

          if (i === global.users.length - 1) {
            alert(message)
          }
          //平倉後重設重複參數
          setRepeatSymbol('')
          setRepeatSide('')
          setRepeatPrice(0)
          // return true
        })
    }
  }
  //市價止損單
  const stopLossOrder = async () => {
    const regex = new RegExp("^[1-9][0-9]?$|^100$");
    if (!regex.test(inputValueStopLoss)) {
      alert("請輸入1到100的數字")
      return
    }

    var message = ""
    if (!global.users) return
    for await (let [i, user] of global.users.entries()) {
      Object.values(user.position)
        .filter((item) => Math.abs(item.positionAmt) > 0)
        .map(async (p) => {
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

          await marketStopLoss(user.exchange, symbol, side, Math.abs(p.positionAmt), stopPrice)
            .then((result) => {
              message = message + "user: " + user.id + " 委託成功: " + symbol + " 止損價格: " + result.stopPrice + "\n"
            }).catch((e) => {
              message = message + "user: " + user.id + ", " + symbol + " 委託失敗： " + e + "\n"
            })
          if (i === global.users.length - 1) {
            alert(message)
          }
          // return true
        })
    }
  }

  //追蹤止盈單
  const trailingOrder = async () => {
    if (!(parseInt(activationPercentage) <= 500 && 1 <= parseInt(activationPercentage))) {
      alert("目標%數請輸入1-500的數字")
      return
    }
    if (!(parseInt(callbackRate) <= 5 && 0.5 <= parseInt(callbackRate))) {
      alert("追蹤%數請輸入0.1-5的數字")
      return
    }


    if (!global.users) return
    var message = ""
    for (let [i, user] of global.users.entries()) {
      Object.values(user.position)
        .filter((item) => Math.abs(item.positionAmt) > 0)
        .map(async (p) => {
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

          await trailingStop(user.exchange, symbol, side, Math.abs(p.positionAmt), activationPrice, callbackRate)
            .then((result) => {
              console.log(result)
              message = message + "user: " + user.id + " 委託成功: " + symbol + " 觸發價格: " + result.info.activatePrice + "\n"
            }).catch((e) => {
              message = message + "user: " + user.id + ", " + symbol + " 委託失敗： " + e + "\n"
              // console.log(message)
            })
          if (i === global.users.length - 1) {
            alert(message)
          }
          // return true
        })
    }
  }

  //設定重複賣出參數 以第一個userexchange為代表
  const onClickSetRepeatParams = () => {
    if (!(parseInt(repeatPercentage) <= 100 && 1 <= parseInt(repeatPercentage))) {
      alert("設定%數請輸入1-100的數字")
      return
    }
    Object.values(global.users[0].position)
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

        setRepeatSymbol(symbol)
        setRepeatSide(side)
        setRepeatPrice(stopPrice)
        return true
      })
  }


  //重複比對是否要賣出
  const repeatSell = () => {
    if (!global.users) return
    for (let user of global.users) {
      if (user.position !== undefined) {
        let positionAmount = 0
        // let positionSymbol = ''
        Object.values(user.position)
          .filter((item) => Math.abs(item.positionAmt) > 0)
          .map((p) => {
            positionAmount = parseFloat(p.positionAmt)
            // positionSymbol = p.symbol
          }
          )

        //持多倉狀況
        if (repeatSymbol === symbol && repeatSide === "sell" && repeatPrice > price && repeatPrice !== 0) {
          var message = ""
          //有"只平倉"參數
          closeMarketOrder(
            user.exchange,
            symbol,
            repeatSide,
            positionAmount
          )

          console.log("多單止損rrr")
          if (positionAmount == 0) {
            setRepeatSymbol('')
            setRepeatSide('')
            setRepeatPrice(0)
          }
        }
        //持空倉狀況
        else if (repeatSymbol === symbol && repeatSide === "buy" && repeatPrice < price && repeatPrice !== 0) {
          //有"只平倉"參數
          console.log(user.exchange,
            symbol,
            repeatSide,
            Math.abs(positionAmount)
          )
          closeMarketOrder(
            user.exchange,
            symbol,
            repeatSide,
            Math.abs(positionAmount)
          )
          if (positionAmount == 0) {
            setRepeatSymbol('')
            setRepeatSide('')
            setRepeatPrice(0)
          }
          console.log("空單止損rrr")
        }
        else {
          console.log("nothing happend")
        }
      }
    }
  }

  const resetRepeat = () => {
    setRepeatPrice(0)
    setRepeatSide('')
    setRepeatSymbol('')
  }

  //取消所有掛單
  const cancelAllOrder = async () => {

    var message = ""

    for (let [i, user] of global.users.entries()) {
      const orderData = await getAllOrder(user.exchange, symbol)
      orderData.map(async (item) => {
        await cancelOrder(user.exchange, item.id, symbol)
          .then((result) => {
            // console.log(result)
            message = message + "user: " + user.id + " 委託已撤銷: " + symbol + "\n"
          }).catch((e) => {
            message = message + "user: " + user.id + ", " + symbol + " 委託單撤銷失敗： " + e + "\n"
          })
        if (i === global.users.length - 1) {
          alert(message)
        }
      })
      // console.log(user.id,orderData.map((item)=>item.id))
    }
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
        <span className="text-red-600 text-lg mr-5 font-bold">以下皆用市價根據%數算出止盈/止損價格</span>
      </div>
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">(全倉)市價止損掛單參數:</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">觸發止損價格(持多倉/持空倉):

          {parseFloat((((100 - parseFloat((inputValueStopLoss / leverage).toFixed(2))) / 100) * price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length - 2))}
          /
          {parseFloat((((100 + parseFloat((inputValueStopLoss / leverage).toFixed(2))) / 100) * price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length - 2))}
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
        <span className="text-red-600 text-lg mr-5 font-bold">(全倉)重複止損直到平倉:</span>
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
          {parseFloat((((100 - parseFloat((repeatPercentage / leverage).toFixed(2))) / 100) * price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length - 2))}
          /
          {parseFloat((((100 + parseFloat((repeatPercentage / leverage).toFixed(2))) / 100) * price).toFixed(!minTickerSize ? 0 : minTickerSize.toString().length - 2))}
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
        <span className="text-red-600 text-lg mr-5 font-bold">(全倉)追蹤止盈掛單:</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">目標價格(持多倉/持空倉):
          {parseFloat(
            (((100 + parseFloat((activationPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              !minTickerSize ? 0 : minTickerSize.toString().length - 2
            )
          )}
          /
          {parseFloat(
            (((100 - parseFloat((activationPercentage / leverage).toFixed(2))) / 100) * price).toFixed(
              !minTickerSize ? 0 : minTickerSize.toString().length - 2
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
        <span className="text-red-600 text-lg mr-5 font-bold">一鍵取消幣安上所有委託單:</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">當前幣種:{symbol}</span>
      </div>

      <div className="flex items-center">
        {symbol ? (
          <Button onClick={cancelAllOrder} size="small" variant="contained" color="primary">
            confirm
          </Button>
        ) : (
          <Button disabled onClick={cancelAllOrder} size="small" variant="contained" color="primary">
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
