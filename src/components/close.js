import React, { useState, useEffect, useContext } from 'react'
import Button from '@material-ui/core/Button'
import { GlobalContext } from '../context'
import { InputTextField } from '../styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import { marketOrder } from '../api'
import _ from 'lodash'

const Close = () => {
  const [global] = useContext(GlobalContext)
  const [position, setPosition] = useState()
  const [inputValue, setInpuValue] = useState()
  const [symbol, setSymbol] = useState('')

  //初始化拿position
  useEffect(() => {
    // setPosition(_.get(global, 'position', 0))
    setPosition(global.position)
    setSymbol(global.symbol)
  }, [global])

  //一鍵平倉 func 
  const sellAll = () => {
    Object.values(position)
      .filter((item) => Math.abs(item.positionAmt)> 0)
      .map((p) => {
        console.log(p.future, 'old', p.positionAmt, Math.abs(p.positionAmt))
        let side = ''
        //倉位數量大於0，一鍵平倉side則設為sell，反之則相反
        if (p.positionAmt > 0 ) {
          side = 'sell'
        }
        if (p.positionAmt < 0) {
          side = 'buy'
        }
        // 勿刪
        // console.log("%%%",(inputValue / 100).toFixed(2))
        // console.log(symbol, 'new', side, Math.floor(Math.abs(p.positionAmt) * (inputValue / 100) * 1000)/1000)
        
        marketOrder(symbol, side, Math.floor(Math.abs(p.positionAmt) * (inputValue / 100) * 1000)/1000)
      })
  }

  const handleChangeInput = (event) => {
    setInpuValue(event.target.value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">止盈/止損參數:</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">止損%數:</span>
        <InputTextField
          label="止損%數"
          variant="outlined"
          color="primary"
          size="small"
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
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
          onChange={handleChangeInput}
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
