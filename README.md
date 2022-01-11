# zwdd

专有钉钉node-sdk

## Install

```shell
npm install zwdd
# or
yarn add zwdd
```

## Usage

```typescript
import SDK from 'zwdd';

const sdk = new SDK({
    appKey: 'APP_KEY',
    appSecret: 'APP_SECRET',
});
```

## API Interface
```typescript
export default class ZWDD {
    constructor(options: Options);
    request<T = any>(api: string, init?: RequestInit): Promise<T>;
    getAccessToken(): Promise<string>;
    getAppUserInfo(authCode: string): Promise<UserInfo>;
    getJSApiTicket(): Promise<string>;
}

interface Options {
    appKey: string;
    appSecret: string;
    endpoint?: string;
    hostIp?: string; // server local ip
    hostMac?: string; // server local mac address 
}
```
