import React, { useEffect, useCallback, useContext } from 'react'
import moment from 'moment'
import { GlobalContext } from '../context'
import { getServerTime, getTicker } from '../api'

const Period = () => {
  const [global, setGlobal] = useContext(GlobalContext)

  const callAPI = useCallback(async () => {
    // 更新global
    const timeData = await getServerTime()
    setGlobal((prev) => {
      return {
        ...prev,
        time: timeData['serverTime'], // 更新時間
      }
    })


  }, [])

  // 定時打API
  const INTERVAL_TIME = 3000 // 間隔時間
  useEffect(() => {
    const intervalId = setInterval(() => {
      callAPI()
    }, INTERVAL_TIME)
    return () => clearInterval(intervalId)
  }, [callAPI])

  return <></>
}

export default Period
