import request, { AuthOptions, RequestInit } from './lib/request';
import { sign } from './lib/crypto';
import type * as Types from './types';

export * from './lib/request';
export * from './types';

type PartialOptional<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> & Partial<Pick<T, K>>

export type Options = PartialOptional<AuthOptions, 'hostIp' | 'hostMac' | 'endpoint'>

export const DEFAULT_ENDPOINT = 'https://openplatform.dg-work.cn';

export default class ZWDD {
    private readonly appKey: string;

    private readonly appSecret: string;

    private readonly endpoint: string;

    private readonly hostIp: string;

    private readonly hostMac: string;

    private accessToken?: Types.AccessTokenResponse['accessToken'];

    private accessTokenExpiresAt = 0;

    constructor(options: Options) {
        this.appKey = options.appKey;
        this.appSecret = options.appSecret;
        this.endpoint = (options.endpoint || DEFAULT_ENDPOINT).replace(/\/+$/, '');

        this.hostIp = options.hostIp || '127.0.0.1';
        this.hostMac = options.hostMac || '00:00:00:00:00:00';
    }

    public async request<T = any>(api: string, init: Omit<RequestInit, keyof AuthOptions> = {}) {
        api = !api.startsWith('/') ? `/${api}` : api;

        return request<T>(api, {
            ...init,
            hostIp: this.hostIp,
            hostMac: this.hostMac,
            appKey: this.appKey,
            appSecret: this.appSecret,
            endpoint: this.endpoint,
        });
    }

    public async getAccessToken() {
        if (this.accessToken && this.accessTokenExpiresAt > Date.now()) {
            return this.accessToken;
        }

        const res = await this.request<Types.AccessTokenResponse>('/gettoken.json', {
            query: {
                appKey: this.appKey,
                appSecret: this.appSecret,
            },
        });

        this.accessToken = res.accessToken;
        this.accessTokenExpiresAt = Date.now() + res.expiresIn * 1000;

        return this.accessToken;
    }

    public async getAppUserInfo(authCode: string) {
        const accessToken = await this.getAccessToken();

        return await this.request<Types.UserInfo>('/rpc/oauth2/dingtalk_app_user.json', {
            method: 'POST',
            body: {
                access_token: accessToken,
                auth_code: authCode,
            },
        });
    }

    public async getJSApiTicket() {
        const accessToken = await this.getAccessToken();

        const { accessToken: ticket } = await this.request<Types.AccessTokenResponse>('/get_jsapi_token.json', {
            method: 'POST',
            body: {
                access_token: accessToken,
            },
        });

        return ticket;
    }
}

export {
    request,
    sign,
};
