import React, { createContext, useState } from 'react'

export const GlobalContext = createContext()

/* 
    value是存全域變數的地方
    setValue可以更新全域變數

    用法是在其他component加入1,2,3
    1. import React, { useContext } from 'react'
    2. import { GlobalContext } from './context'

    const OtherComponent = () => {
    3.   const [global, setGlobal] = useContext(GlobalContext)  //在其他component就可以拿到這裡value的資料
    }
*/
export const StateProvider = ({ children }) => {
  const [value, setValue] = useState({})
  return <GlobalContext.Provider value={[value, setValue]}>{children}</GlobalContext.Provider>
}
