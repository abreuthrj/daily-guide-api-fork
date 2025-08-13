// import cryptoConfig from '#/config/crypto-config';
// import { CryptoConfig } from '#/config/interfaces/crypto-config.interface';
// import { Inject, Injectable } from '@nestjs/common';
// import * as crypto from 'crypto';

// @Injectable()
// export class CryptoService {
//   constructor(
//     @Inject(cryptoConfig.KEY)
//     private readonly cryptoConfig: CryptoConfig,
//   ) {}

//   encrypt(data: string): string {
//     const encoder = crypto.createCipheriv(
//       this.cryptoConfig.algorithm,
//       this.cryptoConfig.secret,
//       crypto.randomBytes(16),
//     );

//     let encrypted = encoder.update(data, 'hex', 'utf-8');
//     encrypted += encoder.final('base64');

//     return encrypted;
//   }

//   decrypt(data: string): string {
//     const decoder = crypto.createCipheriv(
//       this.cryptoConfig.algorithm,
//       this.cryptoConfig.secret,
//       crypto.randomBytes(16),
//     );

//     let decrypted = decoder.update(data, 'utf-8', 'hex');
//     decrypted += decoder.final('hex');

//     return decrypted;
//   }
// }
