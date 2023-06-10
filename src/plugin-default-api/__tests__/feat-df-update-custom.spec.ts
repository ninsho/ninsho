import { MemberInsert } from 'ninsho-base'
import { prop, member01, session01 } from './x-data'
import {
  TestHook,
  TestHookFail,
  initializeLocalPlugin,
  fundamentalDataCreation as setData01ToDatabase,
} from './x-service'

const { pool, plugin } = initializeLocalPlugin()

describe('df-update-custom', () => {
  it('200: Positive case', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      view_name: 'test changed',
      birthday: '2020-01-01',
      __hookData: {
        example: 123,
      },
    })
  })

  it('200: options.clear', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        clear: true,
      }
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      birthday: '2020-01-01',
      __hookData: {
        example: 123,
      },
    })
  })

  it('401: no session', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token + 'XXX',
      session01.m_ip,
      session01.m_device
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(401)
  })

  it('403: role', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        rolePermissionLevel: 1,
      }
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(403)
    expect(res.body).toEqual({ replyCode: [2011] })
  })

  it('403: status', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // brake
    await pool.updateOneOrThrow<MemberInsert>(
      { m_status: 0 },
      { m_name: member01.m_name },
      'AND',
      'members'
    )
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(403)
  })

  it('200: hook: beforePasswordCheck', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        hooks: [
          {
            hookPoint: 'beforePasswordCheck',
            hook: TestHook(),
          },
        ],
      }
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      view_name: 'test changed',
      birthday: '2020-01-01',
      __hookData: {
        example: 123,
      },
    })
  })

  it('500: fail hook: beforePasswordCheck', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        hooks: [
          {
            hookPoint: 'beforePasswordCheck',
            hook: TestHookFail(),
          },
        ],
      }
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(500)
  })

  it('200: good password', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        pass: 'pass1234',
      }
    )
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
  })

  it('401: bad password', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.updateCustom<{
      view_name: string
      birthday: string
    }>(
      {
        view_name: 'test changed',
        birthday: '2020-01-01',
      },
      prop.session_token,
      session01.m_ip,
      session01.m_device,
      {
        pass: 'XXX',
      }
    )
    if (!!!res.fail()) throw 1
    expect(res.statusCode).toEqual(401)
  })
})
