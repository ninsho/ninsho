import {
  calibrationOfColumnsForMembers,
  calibrationOfColumnsForMix,
} from '../column-to-retrieve'

describe('utils-column-to-retrieve', () => {
  it('SCS: calibrationOfColumnsForMembers', () => {
    const res = calibrationOfColumnsForMembers(['m_name'], ['m_mail', 'm_pass'])
    expect(res).toEqual(['m_name', 'm_mail', 'm_pass'])
  })

  it('SCS: calibrationOfColumnsForMembers', () => {
    const res = calibrationOfColumnsForMembers(null as any, [
      'm_mail',
      'm_pass',
    ])
    expect(res).toEqual(['m_mail', 'm_pass'])
  })

  it('SCS: calibrationOfColumnsForMembers', () => {
    const res = calibrationOfColumnsForMembers('*', ['m_mail', 'm_pass'])
    expect(res).toEqual('*')
  })

  it('SCS: calibrationOfColumnsForMix', () => {
    const res = calibrationOfColumnsForMix(
      ['members.m_name'],
      ['members.m_mail', 'members.m_pass']
    )
    expect(res).toEqual(['members.m_name', 'members.m_mail', 'members.m_pass'])
  })

  it('SCS: calibrationOfColumnsForMix', () => {
    const res = calibrationOfColumnsForMix(null as any, [
      'members.m_mail',
      'members.m_pass',
    ])
    expect(res).toEqual(['members.m_mail', 'members.m_pass'])
  })

  it('SCS: calibrationOfColumnsForMix', () => {
    const res = calibrationOfColumnsForMix('*', [
      'members.m_mail',
      'members.m_pass',
    ])
    expect(res).toEqual('*')
  })
})
