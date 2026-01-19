"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const xml_js_1 = __importDefault(require("xml-js"));
class PKCS7 {
    decode(text) {
        let pad = text[text.length - 1];
        if (pad < 1 || pad > 32) {
            pad = 0;
        }
        return text.slice(0, text.length - pad);
    }
    encode(text) {
        const blockSize = 32;
        const textLength = text.length;
        const amountToPad = blockSize - (textLength % blockSize);
        const result = Buffer.alloc(amountToPad);
        result.fill(amountToPad);
        return Buffer.concat([text, result]);
    }
}
class WechatMsgSignUtils {
    static checkSignature(token, signature, timestamp, nonce) {
        const tmpArr = [token, timestamp, nonce];
        tmpArr.sort();
        const tmpStr = tmpArr.join('');
        const hash = crypto_1.default.createHash('sha1');
        hash.update(tmpStr);
        const tmpHash = hash.digest('hex');
        if (tmpHash === signature) {
            return true;
        }
        else {
            return false;
        }
    }
    static checkEncryptSignature(token, signature, timestamp, nonce, encrypt) {
        const tmpArr = [token, timestamp, nonce, encrypt];
        tmpArr.sort();
        const tmpStr = tmpArr.join('');
        const hash = crypto_1.default.createHash('sha1');
        hash.update(tmpStr);
        const tmpHash = hash.digest('hex');
        if (tmpHash === signature) {
            return true;
        }
        else {
            return false;
        }
    }
    static buildEncryptSignature(token, timestamp, nonce, encrypt) {
        const tmpArr = [token, timestamp, nonce, encrypt];
        tmpArr.sort();
        const tmpStr = tmpArr.join('');
        const hash = crypto_1.default.createHash('sha1');
        hash.update(tmpStr);
        return hash.digest('hex');
    }
    static decrypt(text, encodingAESKey) {
        let AESKey = Buffer.from(encodingAESKey + '=', 'base64');
        if (AESKey.length !== 32) {
            throw new Error('encodingAESKey invalid');
        }
        const key = AESKey;
        const iv = AESKey.slice(0, 16);
        const pkcs7 = new PKCS7();
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
        decipher.setAutoPadding(false);
        let deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);
        deciphered = pkcs7.decode(deciphered);
        const content = deciphered.slice(16);
        const length = content.slice(0, 4).readUInt32BE(0);
        const message = content.slice(4, length + 4).toString();
        const xmlObject = xml_js_1.default.xml2js(message, {
            compact: true,
            instructionHasAttributes: true
        });
        const result = {};
        for (const key in xmlObject.xml) {
            if (xmlObject.xml[key]._cdata) {
                result[key.toLowerCase()] = xmlObject.xml[key]._cdata;
            }
            else if (xmlObject.xml[key]._text) {
                result[key.toLowerCase()] = xmlObject.xml[key]._text;
            }
        }
        return {
            xml: result,
            appId: content.slice(length + 4).toString()
        };
    }
    static encrypt(text, encodingAESKey, appId) {
        let AESKey = Buffer.from(encodingAESKey + '=', 'base64');
        if (AESKey.length !== 32) {
            throw new Error('encodingAESKey invalid');
        }
        const key = AESKey;
        const iv = AESKey.slice(0, 16);
        const pkcs7 = new PKCS7();
        const randomString = crypto_1.default.pseudoRandomBytes(16);
        const msg = Buffer.from(text);
        const msgLength = Buffer.alloc(4);
        msgLength.writeUInt32BE(msg.length, 0);
        const id = Buffer.from(appId);
        const bufMsg = Buffer.concat([randomString, msgLength, msg, id]);
        const encoded = pkcs7.encode(bufMsg);
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
        cipher.setAutoPadding(false);
        const cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);
        return cipheredMsg.toString('base64');
    }
    static encryptResponse(text, encodingAESKey, token, appId) {
        const encrypt = this.encrypt(text, encodingAESKey, appId);
        const timestamp = parseInt(String(Date.now() / 1000));
        const nonce = Math.random().toString().slice(2, 10);
        const msgSignature = this.buildEncryptSignature(token, timestamp.toString(), nonce, encrypt);
        return {
            Encrypt: encrypt,
            MsgSignature: msgSignature,
            TimeStamp: timestamp,
            Nonce: nonce
        };
    }
}
exports.default = WechatMsgSignUtils;
//# sourceMappingURL=WechatMsgSignUtils.js.map