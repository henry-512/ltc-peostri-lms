/**
* @file Progress Status Methods
* @module ProgressStatus
* @category Utilities
* @author Braden Cariaga
*/

import green from '@mui/material/colors/green';
import amber from '@mui/material/colors/amber';
import red from '@mui/material/colors/red';

const getProgressStatus = (suspense: string | Date) => {
    const recordDate = new Date(suspense);
    const nowTime = Date.now();
    const recordTime = recordDate.getTime();
    const timeDiff = Math.abs(nowTime - recordTime);
    const DAY = 1000 * 60 * 60 * 24;
    const AMBER_TIME = parseInt(process.env.REACT_APP_AMBER_DAYS || "5") * DAY;

    if (nowTime < recordTime && timeDiff > AMBER_TIME)
        return "GREEN"
    if (nowTime < recordTime && timeDiff <= AMBER_TIME)
        return "AMBER"
    if (nowTime >= recordTime)
        return "RED"
}

const getProgressStatusColor = (suspense: string | Date) => {
    switch(getProgressStatus(suspense)) {
        case 'GREEN':
            return green[500]
        case 'AMBER':
            return amber[500]
        case 'RED':
            return red[500]
    }
}

export {
    getProgressStatus,
    getProgressStatusColor   
};