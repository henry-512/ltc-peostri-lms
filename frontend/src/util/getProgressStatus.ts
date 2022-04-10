const getProgressStatus = (suspense: string | Date) => {
    const recordDate = new Date(suspense);
    const nowTime = Date.now();
    const recordTime = recordDate.getTime();
    const timeDiff = Math.abs(nowTime - recordTime);
    const DAY = 1000 * 60 * 60 * 24;
    const AMBER_TIME = 5 * DAY;

    if (nowTime < recordTime && timeDiff > AMBER_TIME)
        return "GREEN"
    if (nowTime < recordTime && timeDiff <= AMBER_TIME)
        return "AMBER"
    if (nowTime >= recordTime)
        return "RED"
}

export default getProgressStatus;