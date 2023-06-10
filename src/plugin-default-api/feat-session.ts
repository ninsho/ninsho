import { MStatus, MemberInsert, SessionInsert } from 'ninsho-base'
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
import { DefaultAPIConfig, LendOfHere } from './plugin-default-api'

export class Session {
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
      userAgent?: string
    }
  ): Promise<
    IApiResult<
      {
        name: string
        password_last_update_utc: string
      },
      void,
      E500 | E400 | E401 | E403 | E404
    >
  > {
    const lend = this.lend
    const req = {
      sessionToken,
      ip,
      sessionDevice,
      options: {
        userAgent: options?.userAgent ?? '',
      },
    }

    const session = await lend.modules.pool.retrieveMemberIfSessionPresentOne<
      MemberInsert & SessionInsert
    >(
      lend.modules.secure.toHashForSessionToken(req.sessionToken),
      getNowUnixTime() - lend.options.sessionExpirationSec,
      req.sessionDevice,
      req.ip,
      ['members.m_name', 'members.m_status', 'members.pass_upd_at']
    )
    if (session.fail()) return session.pushReplyCode(2008)
    if (session.response.m_status != MStatus.ACTIVE) return new E403(2009)

    return new ApiSuccess(200, {
      name: session.response.m_name,
      password_last_update_utc: session.response.pass_upd_at,
    })
  }
}
