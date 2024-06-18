export const timestampToSeconds = (timeStamp: string): number => 
    timeStamp.split(":").reverse().reduce((prev, curr, indx) => prev + +curr * Math.pow(60, indx), 0);