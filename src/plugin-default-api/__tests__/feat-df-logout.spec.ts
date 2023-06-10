import { MemberInsert } from 'ninsho-base'
import { prop, member01, session01 } from './x-data'
import {
  TestHook,
  TestHookFail,
  initializeLocalPlugin,
  fundamentalDataCreation,
} from './x-service'

const { pool, plugin } = initializeLocalPlugin()

describe('df-logout', () => {
  it('204: Positive case', async () => {
    await fundamentalDataCreation(pool, member01, session01)
    // test
    const res = await plugin.logoutUser(
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        forceAllLogout: true,
      }
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(204)
  })

  it('401: no session', async () => {
    await fundamentalDataCreation(pool, member01, session01)
    // test
    const res = await plugin.logoutUser(
      prop.session_token,
      session01.m_ip,
      session01.m_device + 'XXX'
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(401)
  })

  it('204: status', async () => {
    await fundamentalDataCreation(pool, member01, session01)
    // break
    await pool.updateOneOrThrow<MemberInsert>(
      { m_status: 0 },
      { m_name: member01.m_name },
      'AND',
      'members'
    )
    // test
    const res = await plugin.logoutUser(
      prop.session_token,
      session01.m_ip,
      session01.m_device
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(403)
  })

  it('204: hook: onTransactionLast', async () => {
    await fundamentalDataCreation(pool, member01, session01)
    // test
    const res = await plugin.logoutUser(
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        forceAllLogout: false,
        userAgent: 'fake',
        hooks: [
          {
            hookPoint: 'onTransactionLast',
            hook: TestHook(),
          },
        ],
      }
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(204)
  })

  it('204: fail hook: onTransactionLast', async () => {
    await fundamentalDataCreation(pool, member01, session01)
    // test
    const res = await plugin.logoutUser(
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        forceAllLogout: false,
        userAgent: 'fake',
        hooks: [
          {
            hookPoint: 'onTransactionLast',
            hook: TestHookFail(),
          },
        ],
      }
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(500)
  })
})
