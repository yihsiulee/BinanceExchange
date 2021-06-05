import React, { useState, useEffect, useContext } from 'react'
import Button from '@material-ui/core/Button'
import { GlobalContext } from '../context'
import { InputTextField } from '../styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import _ from 'lodash'

const Close = () => {
  const [global] = useContext(GlobalContext)
  const [position, setPosition] = useState()
  const [inputValue, setInpuValue] = useState()

  //初始化拿position
  useEffect(() => {
    setPosition(_.get(global, 'positionData', 0))
  }, [global])

  const sellAll = () => {
    position
      .filter((item) => item.size > 0)
      .forEach((newPosition) => {
        console.log(newPosition.future, 'old', newPosition.side, newPosition.size)
        let reverseSide = newPosition.side
        if (reverseSide === 'buy') {
          reverseSide = 'sell'
        }
        if (reverseSide.side === 'sell') {
          reverseSide = 'buy'
        }
        console.log(newPosition.future, 'new', reverseSide, (newPosition.size * inputValue) / 100)
        // 此行勿刪
        // marketOrder(newPosition.future, reverseSide, (newPosition.size*inputValue/100))
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
      {/* <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">平倉時間:</span>
        <InputTextField label="平倉時間" variant="outlined" color="primary" size="small" />
      </div> */}
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
        <Button onClick={sellAll} size="small" variant="contained" color="primary">
          confirm
        </Button>
      </div>
    </div>
  )
}
export default Close
