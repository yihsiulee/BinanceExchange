
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
import { VerifiedUserSharp } from '@material-ui/icons'

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
  const [users, setUsers] = useState()
  // const firstUserExchange = _.get(global, 'users[0].exchange', null)


  useEffect(() => {
    if (!global.users) return
    setUsers(global.users)
  }, [global])

  const classes = useStyles()
  if (!users) {
    return <div></div>
  } else {
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
              <StyledTableCell>本日獲利</StyledTableCell>
              <StyledTableCell>本週獲利</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              return (
                <TableRow>
                  <StyledTableCell>{"USER: " + _.get(user, 'id', 0)}</StyledTableCell>
                  <StyledTableCell align="right">{_.get(user.account, 'totalMarginBalance', 0)}</StyledTableCell>
                  <StyledTableCell align="right">{_.get(user.account, 'availableBalance', 0)}</StyledTableCell>
                  <StyledTableCell align="right">{_.get(user.account, 'totalInitialMargin', 0)}</StyledTableCell>
                  <StyledTableCell align="right">{(_.get(user.account, 'totalInitialMargin', 0) / _.get(user.account, 'totalMarginBalance', 0) * 100).toFixed(2)}%</StyledTableCell>
                  <StyledTableCell align="right">{_.get(user.account, 'totalUnrealizedProfit', 0)}</StyledTableCell>
                  <StyledTableCell align="right">{_.get(user, 'profitDay', 0)}</StyledTableCell>
                  <StyledTableCell align="right">{_.get(user, 'profitWeek', 0)}</StyledTableCell>
                </TableRow>)
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}
export default UserInfo
