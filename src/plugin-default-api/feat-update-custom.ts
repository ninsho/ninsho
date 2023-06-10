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
import { HooksObjType, hookCall } from 'ninsho-base'
import { getNowUnixTime } from '../utils/time-utils'
import { mergeDeep } from '../utils/common-utils'
import { DefaultAPIConfig, LendOfHere } from './plugin-default-api'
import { calibrationOfColumnsForMix } from '../utils'

export class UpdateCustom {
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
    custom: Partial<MCustom>,
    sessionToken: string,
    ip: string,
    sessionDevice: string,
    options?: {
      clear?: boolean
      rolePermissionLevel?: number
      pass?: string // Ninsho checks passwords only when there is a password
      columnToRetrieve?: (MembersCol | SessionCol)[] | '*'
      hooks?: HooksObjType[]
    }
  ): Promise<IApiResult<MCustom, void, E500 | E400 | E401 | E403 | E404>> {
    const lend = this.lend
    const req = {
      custom,
      sessionToken,
      sessionDevice,
      ip,
      options: {
        clear: options?.clear ?? false,
        rolePermissionLevel: options?.rolePermissionLevel ?? MRole.User,
        pass: options?.pass, // Ninsho checks passwords only when there is a password
        columnToRetrieve: calibrationOfColumnsForMix(
          options?.columnToRetrieve,
          [
            'members.m_name',
            'members.m_mail',
            'members.m_pass',
            'members.m_role',
            'members.m_status',
            'members.m_custom',
            'members.version',
          ]
        ),
        hooks: options?.hooks,
      },
    }

    const others = { passwordChecked: false }

    const session = await lend.modules.pool.retrieveMemberIfSessionPresentOne<
      MemberInsert & SessionInsert
    >(
      lend.modules.secure.toHashForSessionToken(req.sessionToken),
      getNowUnixTime() - lend.options.sessionExpirationSec,
      req.sessionDevice,
      req.ip,
      req.options.columnToRetrieve
    )
    if (session.fail()) return session.pushReplyCode(2010)
    if (session.response.m_role < req.options.rolePermissionLevel)
      return new E403(2011)
    if (session.response.m_status != MStatus.ACTIVE) return new E403(2012)

    if (req.options.hooks) {
      const res = await hookCall('beforePasswordCheck', lend, {
        req,
        props: session.response,
        others,
        // claims: undefined,
        // connection: undefined
      })
      if (res.fail()) return res.pushReplyCode(2013) as any
    }

    if (
      req.options.pass &&
      !others.passwordChecked &&
      !lend.modules.secure.checkHashPassword(
        req.options.pass,
        session.response.m_pass
      )
    )
      return new E401(2014)

    // - keep __hookData
    const keep__hookData = session.response.m_custom.__hookData
    const newObj = req.options.clear
      ? custom
      : mergeDeep(session.response.m_custom, custom)
    if (keep__hookData) {
      newObj.__hookData = keep__hookData
    }

    const connection = await lend.modules.pool.beginWithClient()

    const upd = await lend.modules.pool.updateOneOrThrow<MemberInsert>(
      {
        m_custom: newObj,
      },
      {
        m_name: session.response.m_name,
        version: session.response.version,
      },
      'AND',
      lend.options.tableName.members,
      connection
    )
    /* istanbul ignore if */
    if (upd.fail()) {
      await lend.modules.pool.rollbackWithRelease(connection)
      return upd.pushReplyCode(2015)
    }

    await lend.modules.pool.commitWithRelease(connection)

    return new ApiSuccess(200, newObj)
  }
}
