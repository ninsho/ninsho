import { prop, member01, session01 } from './x-data'
import {
  initializeLocalPlugin,
  fundamentalDataCreation as setData01ToDatabase,
} from './x-service'

const { pool, plugin } = initializeLocalPlugin()

describe('df-session', () => {
  it('200: Positive case', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.session(
      prop.session_token,
      session01.m_ip,
      session01.m_device
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
  })

  it('200: options', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.session(
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        userAgent: 'testAgent',
      }
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
  })

  it('401: no session', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.session(
      prop.session_token,
      session01.m_ip + '00000000',
      session01.m_device
    )
    expect(res.statusCode).toEqual(401)
  })

  it('403: status', async () => {
    await setData01ToDatabase(
      pool,
      {
        ...member01,
        ...{
          m_status: 0,
        },
      },
      session01
    )
    // test
    const res = await plugin.session(
      prop.session_token,
      session01.m_ip,
      session01.m_device
    )

    expect(res.statusCode).toEqual(403)
  })
})
