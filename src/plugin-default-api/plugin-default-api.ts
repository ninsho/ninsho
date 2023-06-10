import { ModuleBase } from 'ninsho-base'
import { ModulesStoreType, PluginBase } from 'ninsho-base'
import { IOptions } from 'ninsho-base'
import { DeepPartial, mergeDeep } from '../utils/common-utils'
import { GetProps } from './feat-get-props'
import { LogoutUser } from './feat-logout'
import { findUser } from './feat-find-user'
import { Session } from './feat-session'
import { UpdateCustom } from './feat-update-custom'
import { ErrorMessages } from './errors-details'

// - Code required for each plugin -
const pluginName = 'DefaultAPI' // plugin Name
const dependencyModules = ['pool', 'secure'] as const // Required Modules Name

// - boiler template - Specify types only for the modules being used.
export type LendOfHere = {
  options: IOptions
  modules: Pick<ModulesStoreType, (typeof dependencyModules)[number]>
}

export type DefaultAPIConfig = {
  unconfirmedDataExpiryDefaultThresholdSec: number
}

const defaultConfig: DefaultAPIConfig = {
  unconfirmedDataExpiryDefaultThresholdSec: 86400,
}

export class DefaultAPI extends PluginBase {
  // - boiler template -
  readonly pluginName = pluginName

  // - boiler template - store modules
  setModules(modules: {
    [keys: string]: ModuleBase | IOptions
  }): Omit<this, 'pluginName' | 'config' | 'setModules'> {
    this.storeModules(modules, pluginName, dependencyModules)
    return this
  }

  // - plugin specific options -
  config = {} as DefaultAPIConfig
  /**
   * init
   * @param options
   * unconfirmedDataExpiryDefaultThresholdSec: number
   * @returns class
   */
  static init(options: DeepPartial<DefaultAPIConfig> = {}) {
    const instance = new this()
    instance.config = mergeDeep(defaultConfig, options) as DefaultAPIConfig
    return instance
  }

  errorMessages = ErrorMessages
  findUser = findUser.init(this.lend, this.config)
  getProps = GetProps.init(this.lend, this.config)
  logoutUser = LogoutUser.init(this.lend, this.config)
  session = Session.init(this.lend, this.config)
  updateCustom = UpdateCustom.init(this.lend, this.config)
}
