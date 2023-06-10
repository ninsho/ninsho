import {
  getCurrentTimeDiffInSec,
  getNowUnixTime,
  localTimeToUTCUnixTime,
  localTimeToUnixTime,
} from '../time-utils'

describe('utils-time-utils', () => {
  it('SCS: getNowUnixTime', () => {
    expect(getNowUnixTime().toString().length).toEqual(10)
  })

  it('SCS: localTimeToUTCUnixTime', () => {
    expect(localTimeToUTCUnixTime('Wed, 14 Nov 2023 22:13:20 GMT')).toEqual(
      1700000000
    )
  })

  it('SCS: localTimeToUTCUnixTime', () => {
    expect(localTimeToUTCUnixTime().toString().length).toEqual(10)
  })

  it('SCS: getCurrentTimeDiffInSec', async () => {
    const now = getNowUnixTime()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(getCurrentTimeDiffInSec(now) < 3).toEqual(true)
  })

  it('SCS: localTimeToUnixTime', () => {
    expect(localTimeToUnixTime('Wed, 15 Nov 2023 07:13:20 +0900')).toEqual(
      1700000000
    )
  })

  it('SCS: localTimeToUnixTime', () => {
    expect((localTimeToUnixTime() + '').length).toEqual(10)
  })
})
