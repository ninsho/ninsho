import { SessionInsert } from 'ninsho-base'
import { IPoolClient } from 'ninsho-base'
import { E401, E404, E500, IResult, Success } from 'ninsho-base'
import { getNowUnixTime } from '../utils/time-utils'

import { LendOfHere } from './plugin-default-api'

export async function upsertSessionWithReturnedSessionToken(
  lend: LendOfHere,
  role: number,
  name: string,
  ip: string,
  sessionDevice: string,
  connection?: IPoolClient
): Promise<
  IResult<
    {
      sessionToken: string
    },
    E500 | E401 | E404
  >
> {
  const { sessionToken, hashToken } =
    lend.modules.secure.createSessionTokenWithHash()

  const resUpsert = await lend.modules.pool.upsertSessionRecord<SessionInsert>(
    {
      m_name: name,
      m_ip: ip,
      m_device: sessionDevice,
      m_role: role,
      token: hashToken,
      created_time: getNowUnixTime(),
    },
    ['m_name', 'm_ip', 'm_device'],
    ['token'],
    lend.options.tableName.sessions,
    connection
  )
  /* istanbul ignore if */
  if (resUpsert.fail()) return resUpsert.pushReplyCode(2999)

  return new Success({
    sessionToken,
  })
}
