import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import red from '@material-ui/core/colors/red';
import { IProject } from 'src/util/types';

const rowStyle = (record: IProject) => {
    const nowDate = new Date();
    const recordDate = new Date(record.suspense);
    const nowTime = nowDate.getTime();
    const recordTime = recordDate.getTime();
    const timeDiff = Math.abs(nowTime - recordTime);
    const DAY = 1000 * 60 * 60 * 24;
    const AMBER_TIME = 5 * DAY;
    
    let style = {};
    if (!record) {
        return style;
    }

    if (record.status === 'ARCHIVED' || record.status === 'COMPLETED') return style;

    if (nowTime < recordTime && timeDiff > AMBER_TIME)
        return {
            ...style,
            borderLeftColor: green[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    if (nowTime < recordTime && timeDiff <= AMBER_TIME)
        return {
            ...style,
            borderLeftColor: amber[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
            backgroundColor: 'rgb(255, 244, 229)'
        };
    if (nowTime >= recordTime)
        return {
            ...style,
            borderLeftColor: red[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
            backgroundColor: 'rgb(253, 236, 234)'
        };

    return style;
};

export default rowStyle;