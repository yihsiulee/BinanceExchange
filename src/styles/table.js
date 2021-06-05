import { withStyles } from '@material-ui/core/styles'
import TableCell from '@material-ui/core/TableCell';


export const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        backgroundColor: theme.palette.common.grey,
        color: theme.palette.common.white,

        fontSize: 14,
    },
}))(TableCell);

