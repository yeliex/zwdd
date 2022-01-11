import { AuthOptions } from './request';
import { createHmac } from 'crypto';

const getRandom = (length: number) => {
    let value = '';

    for (let i = 0; i < length; i++) {
        value += Math.floor(Math.random() * 10);
    }

    return value;
};

export const createNonce = () => {
    return `${Date.now()}${getRandom(4)}`;
};

interface SignParams extends Pick<AuthOptions, 'appSecret'> {
    method: string;
    timestamp: string;
    nonce: string;
    url: string;
    params?: Record<string, any>;
}

const serializeParams = (input: Record<string, any>) => {
    return Object.keys(input)
        .sort()
        .map(key => {
            const value = input[key];

            if (Array.isArray(value)) {
                return value.sort().map(v => {
                    return `${key}=${v}`;
                }).join('&');
            }

            return `${key}=${value}`;
        })
        .join('&');
};

export const sign = (params: SignParams) => {
    const data = [
        params.method.toUpperCase(),
        params.timestamp,
        params.nonce,
        params.url,
    ];

    if (params.params) {
        data.push(serializeParams(params.params));
    }

    const crypto = createHmac('sha256', params.appSecret);

    crypto.update(data.join('\n'));

    return crypto.digest('base64');
};
