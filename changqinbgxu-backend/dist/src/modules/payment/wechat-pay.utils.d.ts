export declare function decryptNotifyResource(apiV3Key: string, ciphertextB64: string, nonce: string, associatedData: string): string;
export declare function verifyWechatPayNotify(platformCertPem: string, _serial: string, timestamp: string, nonce: string, body: string, signatureB64: string): boolean;
export declare function buildRequestAuthorization(mchid: string, merchantSerial: string, privateKeyPem: string, method: string, urlPath: string, body: string): {
    authorization: string;
};
export declare function buildMiniProgramPaySign(appId: string, timeStamp: string, nonceStr: string, pkg: string, privateKeyPem: string): string;
export declare function randomOutTradeNo(): string;
