import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'

export const InputTextField = withStyles({
  root: {
    // input 框顏色
    '& fieldset': {
      borderColor: 'white',
    },
    // input 打字顏色
    '& .MuiInputBase-root': {
      color: 'white',
    },
    // placeholder 字顏色
    '& .MuiInputLabel-marginDense': {
      color: 'white',
    },
    // focus 左上角小字 顏色
    '& .MuiInputLabel-shrink': {
      color: 'white',
    },
    /* focus input 字顏色 */
    '& label.Mui-focused': {
      color: '#3f51b5',
    },
    /* input 單位字顏色 e.g. % */
    '& .MuiTypography-colorTextSecondary': {
      color: 'white',
    },
  },
})(TextField)
