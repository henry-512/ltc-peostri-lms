import green from '@mui/material/colors/green';
import amber from '@mui/material/colors/amber';
import red from '@mui/material/colors/red';
import { IProject } from 'src/util/types';
import getProgressStatus from 'src/util/getProgressStatus';

const rowStyle = (record: IProject) => {    
    let style = {};
    if (!record) {
        return style;
    }

    if (record.status === 'ARCHIVED' || record.status === 'COMPLETED') return style;

    switch(getProgressStatus(record.suspense)) {
        case 'GREEN':
            return {
                ...style,
                borderLeftColor: green[500],
                borderLeftWidth: 5,
                borderLeftStyle: 'solid',
            };
        case 'AMBER':
            return {
                ...style,
                borderLeftColor: amber[500],
                borderLeftWidth: 5,
                borderLeftStyle: 'solid',
                backgroundColor: 'rgb(255, 244, 229)'
            };
        case 'RED':
            return {
                ...style,
                borderLeftColor: red[500],
                borderLeftWidth: 5,
                borderLeftStyle: 'solid',
                backgroundColor: 'rgb(253, 236, 234)'
            };
    }

    return style;
};

export default rowStyle;