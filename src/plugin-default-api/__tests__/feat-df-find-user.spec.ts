import { prop, member01, session01 } from './x-data'
import {
  initializeLocalPlugin,
  fundamentalDataCreation as setData01ToDatabase,
} from './x-service'

const { pool, plugin } = initializeLocalPlugin()

describe('df-find-user', () => {
  it('200: Positive case', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.findUser('test_user')
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
    expect(res.body.exist).toEqual(true)
  })

  it('200: Positive case', async () => {
    await setData01ToDatabase(pool, member01, session01)
    // test
    const res = await plugin.findUser('unknown_user')
    if (res.fail()) throw 1
    expect(res.statusCode).toEqual(200)
    expect(res.body.exist).toEqual(false)
  })
})
