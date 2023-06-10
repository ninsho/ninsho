export const ErrorMessages = {
  2000: null,
  2001: null,
  2002: 'No role permissions.',
  2003: 'Unauthorized status.',
  2004: null,
  2005: 'Unauthorized status.',
  2006: null,
  2007: null,
  2008: null,
  2009: 'Unauthorized status.',
  2010: null,
  2011: 'No role permissions.',
  2012: 'Unauthorized status.',
  2013: null,
  2014: 'Passwords do not match.',
  2015: null,

  2099: null,
} as const
export type EM = typeof ErrorMessages & { [key: number]: string | null }

// Regular expression for searching the target line
// new E\d+|pushReplyCode\(
