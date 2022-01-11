export interface AccessTokenResponse {
    expiresIn: number;
    accessToken: string;
}

export interface UserInfo {
    account: string; // 账号名
    accountId: number; // 账号id
    clientId: string; // 应用名
    employeeCode: string; // 租户下人员编码
    lastName: string; // 姓名
    namespace: string; // 账号类型
    nickNameCn: string; // 昵称
    realmId: number; // 租户id
    realmName: string; // 租户名称
    tenantUserId: string; // 租户+用户唯一标识
    openid: string; // 应用+用户唯一标识
}
