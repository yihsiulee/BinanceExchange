import React, { useEffect, useCallback, useContext } from 'react'
import { GlobalContext } from '../context'
import { getServerTime } from '../api'
import _ from 'lodash'

const Period = () => {
  const [global, setGlobal] = useContext(GlobalContext)
  const firstUserExchange = _.get(global, 'users[0].exchange', null)

  const callAPI = useCallback(async () => {
    // 更新global
    // console.log('global:', global)
    const timeData = await getServerTime(firstUserExchange)
    // const account = await getAccount()
    setGlobal((prev) => {
      return {
        ...prev,
        time: timeData['serverTime'], // 更新時間
      }
    })
  }, [global, firstUserExchange])

  // 定時打API
  const INTERVAL_TIME = 1000 // 間隔時間
  useEffect(() => {
    const intervalId = setInterval(() => {
      callAPI()
    }, INTERVAL_TIME)
    return () => clearInterval(intervalId)
  }, [callAPI])

  return <></>
}

export default Period
