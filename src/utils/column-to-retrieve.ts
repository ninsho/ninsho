import { MemberInsert, MembersCol, SessionCol } from 'ninsho-base'

export function calibrationOfColumnsForMembers(
  columnToRetrieve: (keyof MemberInsert)[] | '*' | undefined,
  fillArr: (keyof MemberInsert)[]
): (keyof MemberInsert)[] | '*' {
  if (!columnToRetrieve) {
    return fillArr
  }

  if (columnToRetrieve !== '*') {
    return [...new Set([...columnToRetrieve, ...fillArr])]
  }
  return columnToRetrieve
}

export function calibrationOfColumnsForMix(
  columnToRetrieve: (MembersCol | SessionCol)[] | '*' | undefined,
  fillArr: (MembersCol | SessionCol)[]
): (MembersCol | SessionCol)[] | '*' {
  if (!columnToRetrieve) {
    return fillArr
  }

  if (columnToRetrieve !== '*') {
    return [...new Set([...columnToRetrieve, ...fillArr])]
  }
  return columnToRetrieve
}
