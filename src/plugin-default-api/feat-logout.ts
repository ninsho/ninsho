import {
  MStatus,
  MemberInsert,
  MembersCol,
  SessionCol,
  SessionInsert,
} from 'ninsho-base'
import {
  ApiSuccess,
  E400,
  E401,
  E403,
  E404,
  E500,
  IApiResult,
} from 'ninsho-base'
import { getNowUnixTime } from '../utils/time-utils'
import { HooksObjType, hookCall } from 'ninsho-base'
import { calibrationOfColumnsForMix } from '../utils/column-to-retrieve'
import { DefaultAPIConfig, LendOfHere } from './plugin-default-api'

export class LogoutUser {
  // - boiler plate -
  lend = {} as LendOfHere
  config = {} as DefaultAPIConfig
  static init(lend: LendOfHere, config: DefaultAPIConfig) {
    const instance = new this()
    instance.lend = lend
    instance.config = config
    return instance.method
  }

  private async method(
    sessionToken: string,
    ip: string,
    sessionDevice: string,
    options?: {
      forceAllLogout?: boolean
      userAgent?: string
      columnToRetrieve?: (MembersCol | SessionCol)[] | '*'
      hooks?: HooksObjType[]
    }
  ): Promise<IApiResult<null, void, E400 | E401 | E403 | E404 | E500>> {
    const lend = this.lend
    const req = {
      sessionToken,
      ip,
      sessionDevice,
      options: {
        forceAllLogout: options?.forceAllLogout === true ? true : false,
        userAgent: options?.userAgent || '',
        columnToRetrieve: calibrationOfColumnsForMix(
          options?.columnToRetrieve,
          [
            'members.m_custom',
            'members.m_name',
            'members.m_mail',
            'members.m_pass',
            'members.m_role',
            'members.m_status',
            'members.version',
          ]
        ),
        hooks: options?.hooks,
      },
    }

    // Inspect Session

    const session = await lend.modules.pool.retrieveMemberIfSessionPresentOne<
      MemberInsert & SessionInsert
    >(
      lend.modules.secure.toHashForSessionToken(req.sessionToken),
      getNowUnixTime() - lend.options.sessionExpirationSec,
      req.sessionDevice,
      req.ip,
      req.options.columnToRetrieve
    )
    if (session.fail())
      /* istanbul ignore next */ return session.pushReplyCode(2004)
    if (session.response.m_status != MStatus.ACTIVE) return new E403(2005)

    const connection = await lend.modules.pool.beginWithClient()

    // Logout

    const condition: {
      m_name: string
      m_ip?: string
      m_device?: string
    } = {
      m_name: session.response.m_name,
    }
    if (!req.options.forceAllLogout) {
      condition.m_ip = req.ip
      condition.m_device = req.sessionDevice
    }

    const delSessions = await lend.modules.pool.delete<SessionInsert>(
      condition,
      lend.options.tableName.sessions,
      connection
    )
    /* istanbul ignore if */
    if (delSessions.fail()) {
      await lend.modules.pool.rollbackWithRelease(connection)
      return delSessions.pushReplyCode(2006)
    }

    if (req.options.hooks) {
      const res = await hookCall('onTransactionLast', lend, {
        req,
        props: session.response,
        connection,
      })
      if (res.fail()) {
        await lend.modules.pool.rollbackWithRelease(connection)
        return res.pushReplyCode(2007) as any
      }
    }

    await lend.modules.pool.commitWithRelease(connection)

    return new ApiSuccess(204, null)
  }
}
