import { MemberInsert } from 'ninsho-base'
import { ApiSuccess, E500, IApiResult } from 'ninsho-base'
import { DefaultAPIConfig, LendOfHere } from './plugin-default-api'

export class findUser {
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
    name: string
  ): Promise<IApiResult<{ exist: boolean }, void, E500>> {
    const lend = this.lend
    const req = {
      name,
    }

    const sel = await lend.modules.pool.selectOne<MemberInsert>(
      lend.options.tableName.members,
      ['m_name'],
      {
        m_name: req.name,
      }
    )
    /* istanbul ignore if */
    if (sel.fail()) return sel.pushReplyCode(2000)

    return new ApiSuccess(200, {
      exist: sel.response === null ? false : true,
    })
  }
}
