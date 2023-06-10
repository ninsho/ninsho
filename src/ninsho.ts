import { IPool, IMailer, INotifier, ISecure } from 'ninsho-base'
import { IOptions, defaultOptions } from 'ninsho-base'
import { DeepPartial, mergeDeep } from './utils/common-utils'
import { DefaultAPI } from './plugin-default-api/plugin-default-api'

type IgnorePublic = 'pluginName' | 'config' | 'setModules'

type ConvertToNameAndClassArray<T extends readonly any[]> = {
  [K in keyof T]: T[K] extends { pluginName: infer P }
    ? [Extract<P, keyof any>, T[K]]
    : never
}

type TupleToPluginObject<T extends readonly [PropertyKey, any][]> = {
  [K in T[number][0]]: Omit<
    Extract<T[number], readonly [K, any]>[1],
    IgnorePublic
  >
}

type PluginObject<T extends readonly any[]> = TupleToPluginObject<
  ConvertToNameAndClassArray<T>
>

export class NinshoCore<X, T extends readonly any[]> {
  private _argObj: T = {} as T

  /**
   * init
   * @param args
   */
  constructor(
    args: X & {
      options?: DeepPartial<IOptions>
      pool?: IPool
      notifier?: INotifier
      mailer?: IMailer
      secure?: ISecure
      plugins?: T
    }
  ) {
    const obj = args as any

    // options
    obj['options'] = mergeDeep(defaultOptions, obj['options'])

    // modules
    const argKeys = Object.keys(args as Record<string, unknown>)
    for (const key of argKeys) {
      if (obj[key].type === 'module') {
        (obj[key] as any).setOptions(args['options'])
      }
    }

    // plugins
    obj.plugins = obj.plugins || []
    for (const plugin of obj.plugins) {
      obj.plugins[plugin.pluginName] = plugin.setModules(obj)
    }

    // default plugin
    if (!Object.keys(obj.plugins).includes('DefaultAPI')) {
      obj.plugins['DefaultAPI'] = DefaultAPI.init().setModules(obj)
    }

    this._argObj = obj
  }

  get plugins(): PluginObject<T> & {
    DefaultAPI: Omit<InstanceType<typeof DefaultAPI>, IgnorePublic>
  } {
    return (this._argObj as any).plugins
  }

  // get plugins(): PluginObject<T> {
  //   return (this._argObj as any).plugins
  // }

  get options(): IOptions {
    return (this._argObj as any).options
  }
}
