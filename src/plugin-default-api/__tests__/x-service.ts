import * as dotenv from 'dotenv'
import { DefaultAPI } from '../plugin-default-api'
import util from 'util'
export const log = (...args: any[]) => {
  process.stdout.write(util.format(...args) + '\n')
}

import ModPg from 'ninsho-module-pg'
import ModSecure from 'ninsho-module-secure'
import { IPool } from 'ninsho-base'
import { MemberInsert, SessionInsert } from 'ninsho-base'
import { defaultOptions } from 'ninsho-base'
import { LendType } from 'ninsho-base'
import { HookAccept } from 'ninsho-base'
import { E500, ErrorBase, IResult, Success } from 'ninsho-base'

jest.setTimeout(8000)

/**
 * initializeLocalPlugin
 * @returns [plugin, env, pool]
 */
export function initializeLocalPlugin() {
  dotenv.config()
  const env = process.env as any

  // pool, secure 読み込み
  const pool = ModPg.init({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
    forceRelease: true,
  }).setOptions(defaultOptions)

  const plugin = DefaultAPI.init().setModules({
    options: defaultOptions,
    pool: pool,
    secure: ModSecure.init({
      secretKey: 'Abracadabra',
    }),
  })

  beforeEach(async function () {
    await pool.truncate(['members', 'sessions'])
    log(expect.getState().currentTestName)
  })

  return {
    plugin,
    env,
    pool,
  }
}

/**
 * fundamentalDataCreation
 * @param pool
 * @param member
 * @param session
 */
export async function fundamentalDataCreation(
  pool: IPool,
  member: Partial<MemberInsert>,
  session: Partial<SessionInsert>
) {
  const client = await pool.beginWithClient()

  const ins1 = await pool.insertOne<MemberInsert>(member, 'members', client)
  /* istanbul ignore if */
  if (ins1.fail()) {
    pool.rollbackWithRelease(client)
    throw 100
  }

  const ins2 = await pool.insertOne<SessionInsert>(session, 'sessions', client)
  /* istanbul ignore if */
  if (ins2.fail()) {
    pool.rollbackWithRelease(client)
    throw 200
  }

  await pool.commitWithRelease(client)
}

/**
 * hook for success
 * @returns hook callback
 */
export const TestHook = () => {
  return async (
    lend: LendType,
    accept: HookAccept
  ): Promise<IResult<any, ErrorBase>> => {
    return new Success(null)
  }
}

/**
 * hook for fail
 * @returns hook callback
 */
export const TestHookFail = () => {
  return async (
    lend: LendType,
    accept: HookAccept
  ): Promise<IResult<any, ErrorBase>> => {
    return new E500(9999)
  }
}
