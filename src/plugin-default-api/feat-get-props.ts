import {
  MRole,
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
import { calibrationOfColumnsForMix } from '../utils/column-to-retrieve'
import { getNowUnixTime } from '../utils/time-utils'
import { DefaultAPIConfig, LendOfHere } from './plugin-default-api'

export class GetProps {
  // - boiler plate -
  lend = {} as LendOfHere
  config = {} as DefaultAPIConfig
  static init(lend: LendOfHere, config: DefaultAPIConfig) {
    const instance = new this()
    instance.lend = lend
    instance.config = config
    return instance.method
  }

  private async method<MCustom>(
    sessionToken: string,
    ip: string,
    sessionDevice: string,
    options?: {
      permissionRole?: number
      userAgent?: string
      columnToRetrieve?: (MembersCol | SessionCol)[] | '*'
    }
  ): Promise<
    IApiResult<MemberInsert<MCustom>, void, E500 | E400 | E401 | E403 | E404>
  > {
    const lend = this.lend
    const req = {
      sessionToken,
      sessionDevice,
      ip,
      options: {
        permissionRole: options?.permissionRole ?? MRole.User,
        userAgent: options?.userAgent || '',
        columnToRetrieve: calibrationOfColumnsForMix(
          options?.columnToRetrieve,
          ['members.m_role', 'members.m_status', 'members.m_custom']
        ),
      },
    }

    const session = await lend.modules.pool.retrieveMemberIfSessionPresentOne<
      MemberInsert<MCustom> & SessionInsert
    >(
      lend.modules.secure.toHashForSessionToken(req.sessionToken),
      getNowUnixTime() - lend.options.sessionExpirationSec,
      req.sessionDevice,
      req.ip,
      req.options.columnToRetrieve
    )
    if (session.fail()) return session.pushReplyCode(2001)
    if (session.response.m_role < req.options.permissionRole)
      return new E403(2002)
    if (session.response.m_status != MStatus.ACTIVE) return new E403(2003)

    return new ApiSuccess(200, session.response)
  }
}
