export function getNowUnixTime() {
  return localTimeToUnixTime()
}

export function localTimeToUnixTime(localTime?: string): number {
  const now = localTime ? new Date(localTime) : new Date()
  return Math.floor(now.getTime() / 1000)
}

export function getCurrentTimeDiffInSec(SecUTC: number): number {
  return getNowUnixTime() - SecUTC
}

// no use
export function localTimeToUTCUnixTime(localTime?: string): number {
  const now = localTime ? new Date(localTime) : new Date()
  return Math.floor(
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
      )
    ).getTime() / 1000
  )
}
