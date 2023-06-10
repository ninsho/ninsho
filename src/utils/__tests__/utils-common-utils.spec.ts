import { mergeDeep } from '../common-utils'

describe('utils-common-utils', () => {
  it('SCS: mergeDeep', () => {
    const res = mergeDeep(
      { a: 1, x: { y: 2 }, b: 'notObject' },
      { a: 1, x: { z: 3 }, b: { c: 1000 } }
    )
    expect(res).toEqual({ a: 1, x: { y: 2, z: 3 }, b: { c: 1000 } })
  })
})
