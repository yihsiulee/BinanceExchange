
import React, { useState, useEffect, useContext } from 'react'
import { getIncome, getPosition, getAccount, getMarkets, getAllImplicitApiMethods, getTrades } from '../api'
import { GlobalContext } from '../context'

import { StyledTableCell } from '../styles'
import _ from 'lodash'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

const useStyles = makeStyles({
  root: {
    // background: 'linear-gradient(55deg, #FE6B8B 20%, #FF8E53 90%)',
    background: '#888888',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  },
})

const UserInfo = () => {
  const [global] = useContext(GlobalContext)
  const [balance, setBalance] = useState()
  const [account, setAccount] = useState({})
  const [, setMarket] = useState({})

  const [trades, setTrades] = useState({})
  const [incomeDay, setIncomeDay] = useState({}) // 近24小時獲利
  const [incomeWeek, setIncomeWeek] = useState({}) // 近7日獲利


  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getAccount()
      // const test = await getAllImplicitApiMethods()
      // console.log(accountData)

      // console.log(test)
      setAccount(accountData)
    }
    getAccountData()
  }, [global])

  useEffect(() => {
    const getIncomeData = async () => {
      const incomeData = await getIncome()

      var total_income_day = 0
      var total_income_week = 0
      Object.values(incomeData)
        .filter((element) => timeDifference(new Date().getTime(), element.time).daysDifference < 7) // 篩出與現在時間差距小於七天的交易
        .map((m) => {
          // 加總近7日獲利
          total_income_week += parseFloat(m.income)
          
          // 加總近24小時獲利
          if (timeDifference(new Date().getTime(), m.time).daysDifference < 1)
            total_income_day += parseFloat(m.income)
        })
      // console.log("近24小時獲利: " + total_income_day)
      // console.log("近7日獲利: " + total_income_week)

      setIncomeDay(total_income_day.toFixed(5))
      setIncomeWeek(total_income_week.toFixed(5))

      // console.log(incomeData)
      setBalance(incomeData)
    }
    getIncomeData()
  }, [global])

  // useEffect(() => {
  //   const getPositionData = async () => {
  //     const positionData = await getPosition()
  //     setPosition(positionData)
  //   }
  //   getPositionData()
  // }, [])

  useEffect(() => {
    const getTradesData = async () => {
      const tradesData = await getTrades()
      // console.log(tradesData)
      setMarket(tradesData)
    }
    getTradesData()
  }, [])

  const classes = useStyles()

  return (
    <TableContainer>
      <Table className={classes.root} aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell>帳號資訊</StyledTableCell>
            <StyledTableCell>帳號總值</StyledTableCell>
            <StyledTableCell>帳號餘額</StyledTableCell>
            <StyledTableCell>已使用</StyledTableCell>
            <StyledTableCell>已開倉%數</StyledTableCell>
            <StyledTableCell>未實現損益</StyledTableCell>
            <StyledTableCell align="right">本日獲利</StyledTableCell>
            <StyledTableCell align="right">本週獲利</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {rows.map((row) => ( */}
          <TableRow>
            <StyledTableCell>{_.get(account, 'result.username', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'totalMarginBalance', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'availableBalance', 0)}</StyledTableCell>

            <StyledTableCell align="right">{_.get(account, 'totalInitialMargin', 0)}</StyledTableCell>
            <StyledTableCell align="right">{(_.get(account, 'totalInitialMargin', 0) / _.get(account, 'totalMarginBalance', 0) * 100).toFixed(2)}%</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'totalUnrealizedProfit', 0)}</StyledTableCell>
            <StyledTableCell align="right">{incomeDay.toString()}</StyledTableCell>
            <StyledTableCell align="right">{incomeWeek.toString()}</StyledTableCell>

          </TableRow>
          {/* ))} */}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
export default UserInfo


function timeDifference(date1, date2) {
  var difference = date1 - date2;

  var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  difference -= daysDifference * 1000 * 60 * 60 * 24

  var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
  difference -= hoursDifference * 1000 * 60 * 60

  var minutesDifference = Math.floor(difference / 1000 / 60);
  difference -= minutesDifference * 1000 * 60

  var secondsDifference = Math.floor(difference / 1000);

  return { daysDifference, hoursDifference }

  // console.log('difference = ' + 
  //   daysDifference + ' day/s ' + 
  //   hoursDifference + ' hour/s ' + 
  //   minutesDifference + ' minute/s ' + 
  //   secondsDifference + ' second/s ');
}
