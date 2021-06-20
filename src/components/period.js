import React, { useEffect, useCallback, useContext } from 'react'
import { GlobalContext } from '../context'
import { getServerTime, getBalance } from '../api'
import _ from 'lodash'

const Period = () => {
  const [global, setGlobal] = useContext(GlobalContext)
  const firstUserExchange = _.get(global, 'users[0].exchange', null)


  const callAPI = useCallback(async () => {
    // 更新global
    // console.log('global:', global)
    const timeData = await getServerTime(firstUserExchange)
    // const balanceData = await getBalance(firstUserExchange)
    // const account = await getAccount()
    setGlobal((prev) => {
      return {
        ...prev,
        periodTime: timeData['serverTime'], // 更新時間
        // availableBalance: parseFloat(
        //   Object.values(balanceData)
        //     .filter((item) => item.asset === 'USDT')
        //     .map((b) => b?.availableBalance)
        // ),
      }
    })
  }, [global, firstUserExchange])

  // 定時打API
  const INTERVAL_TIME = 5000 // 間隔時間
  useEffect(() => {
    const intervalId = setInterval(() => {
      callAPI()
    }, INTERVAL_TIME)
    return () => clearInterval(intervalId)
  }, [callAPI])

  return <></>
}

export default Period
