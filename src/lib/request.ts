import fetch, { FetchError, Headers, RequestInit as OriginRequestInit } from 'node-fetch';
import { stringify } from 'qs';
import { createNonce, sign } from './crypto';

export interface AuthOptions {
    appKey: string;
    appSecret: string;
    endpoint: string;
    hostIp: string;
    hostMac: string;
}

export interface RequestInit extends Omit<OriginRequestInit, 'body'>, AuthOptions {
    query?: Record<string, string>;
    body?: Record<string, any>;
}

export default async function request<T = any>(url: string, init: RequestInit): Promise<T> {
    const timestamp = new Date().toISOString();
    const nonce = createNonce();
    const { endpoint, method = 'GET', appKey, appSecret, hostIp, hostMac, query, body, ...extraInit } = init;

    const signature = sign({
        appSecret,
        method,
        nonce,
        timestamp,
        url,
        params: method === 'GET' ? init.query : (init.body || init.query),
    });

    const headers = new Headers(init.headers);
    headers.set('X-Hmac-Auth-IP', hostIp);
    headers.set('X-Hmac-Auth-MAC', hostMac);
    headers.set('X-Hmac-Auth-Timestamp', timestamp);
    headers.set('X-Hmac-Auth-Version', '1.0');
    headers.set('X-Hmac-Auth-Nonce', nonce);
    headers.set('apiKey', appKey);
    headers.set('X-Hmac-Auth-Signature', signature);

    if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }

    if (query) {
        url += '?' + stringify(query);
    }

    const res = await fetch(`${endpoint}${url}`, {
        method,
        headers,
        ...extraInit,
        body: body ? JSON.stringify(body) : body,
    });

    const data = await res.json();

    if (!data) {
        if (res.status >= 400) {
            throw new FetchError(
                `request to ${endpoint}${url} failed, reason: ${res.status}(${res.statusText})`,
                res.statusText,
            );
        }
        return data;
    }

    if (!('success' in data)) {
        return data;
    }

    if (data.success) {
        return data.content.data;
    }

    const error = new Error(`${data.Code}: ${data.Message} ${data._RequestId} (${data.bizErrorCode})`);

    throw error;
}
