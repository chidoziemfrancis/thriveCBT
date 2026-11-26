import { Global, Module } from '@nestjs/common';

import { ConfigService } from '../../config/config.service.js';
import { FieldCipher } from './field-cipher.js';

@Global()
@Module({
  providers: [
    {
      provide: FieldCipher,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new FieldCipher(config.get('FIELD_ENCRYPTION_KEY')),
    },
  ],
  exports: [FieldCipher],
})
export class CryptoModule {}
