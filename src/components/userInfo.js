import React, { useState, useEffect } from 'react'
import { getBalance, getPosition, getAccount, getMarkets } from '../api'
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
  const [, setPosition] = useState()
  const [account, setAccount] = useState({})
  const [, setMarket] = useState({})

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
    }
    getPositionData()
  }, [])

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getAccount()
      setAccount(accountData)
    }
    getAccountData()
  }, [])
  useEffect(() => {
    const getMarketData = async () => {
      const marketData = await getMarkets()
      setMarket(marketData)
    }
    getMarketData()
  }, [])

  const classes = useStyles()

  return (
    <TableContainer>
      <Table className={classes.root} aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell>帳號資訊</StyledTableCell>
            <StyledTableCell>帳號總值</StyledTableCell>
            <StyledTableCell>已使用</StyledTableCell>
            <StyledTableCell>帳號餘額</StyledTableCell>
            <StyledTableCell align="right">本日獲利</StyledTableCell>
            <StyledTableCell align="right">本週獲利</StyledTableCell>
            <StyledTableCell align="right">已開倉%數</StyledTableCell>
            <StyledTableCell align="right">Total assets</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {rows.map((row) => ( */}
          <TableRow>
            <StyledTableCell>{_.get(account, 'result.username', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'result.totalAccountValue', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(balance, 'USD.free', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(balance, 'used.USD', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'result.username', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'result.username', 0)}</StyledTableCell>
            <StyledTableCell align="right">{_.get(account, 'result.username', 0)}</StyledTableCell>
          </TableRow>
          {/* ))} */}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
export default UserInfo
