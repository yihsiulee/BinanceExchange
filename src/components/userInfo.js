import React, { useState, useEffect } from 'react'
import { getIncome, getAccount, getAllImplicitApiMethods, getTrades } from '../api'
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
  const [balance, setBalance] = useState()
  const [account, setAccount] = useState({})
  const [, setMarket] = useState({})

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getAccount()
      const test = await getAllImplicitApiMethods()
      console.log(accountData)

      console.log(test)
      setAccount(accountData)
    }
    getAccountData()
  }, [])

  useEffect(() => {
    const getIncomeData = async () => {
      const balanceData = await getIncome()
      // const test = await getAllImplicitApiMethods()
      // console.log(balanceData)
      setBalance(balanceData)
    }
    getIncomeData()
  }, [])

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
      console.log(tradesData)
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
            <StyledTableCell align="right">本日獲利</StyledTableCell>
            <StyledTableCell align="right">本週獲利</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {rows.map((row) => ( */}
          <TableRow>
            <StyledTableCell>{_.get(account, 'result.username', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'totalWalletBalance', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'availableBalance', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'totalPositionInitialMargin', 0)}</StyledTableCell>
            <StyledTableCell align="right">
              {(
                (_.get(account, 'totalPositionInitialMargin', 0) / _.get(account, 'totalWalletBalance', 0)) *
                100
              ).toFixed(2)}
              %
            </StyledTableCell>
            <StyledTableCell align="right">{_.get(balance, 'used.USD', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'result.username', 0)}</StyledTableCell>
          </TableRow>
          {/* ))} */}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
export default UserInfo
