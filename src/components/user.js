import React, { useState, useEffect, useContext } from 'react'
import { getBalance, getPosition, getAllImplicitApiMethods, getAccount } from '../api'
import { GlobalContext } from '../context'
import _ from 'lodash'

const User = () => {
  const [balance, setBalance] = useState()
  const [position, setPosition] = useState()
  const [account, setAccount] = useState({})
  const [, setGlobal] = useContext(GlobalContext)

  useEffect(() => {
    const getBalanceData = async () => {
      const balanceData = await getBalance()
      setBalance(balanceData)
    }
    getBalanceData()
  }, [])

  useEffect(() => {
    const getPositionData = async () => {
      const positionData = await getPosition()
      setPosition(positionData)
      setGlobal((prev) => {
        return { ...prev, positionData }
      })
    }
    getPositionData()
  }, [setGlobal])

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getAccount()
      setAccount(accountData)
    }
    getAccountData()
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-5 font-bold">使用者帳號資訊:</span>
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">
          測試用,餘額:{_.get(balance, 'USD.free', 0)},position:{_.get(position, '[1].future', 0)}
        </span>
        {getAllImplicitApiMethods()}
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">帳號名稱:{_.get(account, 'result.username', 0)}</span>
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">盈虧%數:</span>
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">盈虧金額:</span>
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">已開倉%數:</span>
      </div>

      <div className="flex items-center">
        <span className="text-white text-lg mr-5 font-bold">本週獲利:</span>
      </div>
    </div>
  )
}
export default User
