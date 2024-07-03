export type ILoginUser = {
  email: string
  password: string
}

export type ILoginResponse = {
  refreshToken?: string
  accessToken: string
}

export type IRefreshTokenResponse = {
  accessToken: string
}

export type IChangePassword = {
  oldPassword: string
  newPassword: string
}
