import { getNowUnixTime } from '../../utils/time-utils'

export const member01 = {
  // m_pass: 'pass1234',
  m_name: 'test_user',
  m_mail: 'test@example.com',
  m_pass: '$2a$10$G3Z7t3aGdqB8YfeBsT6f3e7AscxN1fOv.yRZV91GKDTEGx2fhma.i',
  m_custom: { view_name: 'Albert Einstein', __hookData: { example: 123 } },
  m_ip: '127.0.0.1',
  m_role: 0,
  m_status: 1,
  otp_hash: null,
  failed_attempts: 0,
  last_failed_attempts_at: null,
}

export const session01 = {
  m_name: 'test_user',
  m_role: 0,
  m_ip: '127.0.0.1',
  m_device: 'test-client',
  token: 'eea8e93dabc15f14b22c64d30024af28a632c02beeb639c6ef1491f3691b1edd',
  created_time: getNowUnixTime(),
}

export const prop = {
  session_token: 'e6e9fd7d-7767-4285-a19e-53b3bde8bd62',
}
