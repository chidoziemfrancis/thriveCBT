import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { ConfigService } from '../../config/config.service.js';
import { AppError } from '../../shared/errors/app-error.js';
import { EMAIL_ERRORS } from '../../shared/errors/codes/email.errors.js';

export type EmailMessage = { to: string; subject: string; text: string };

const SEND_TIMEOUT_MS = 10_000;

@Injectable()
export class EmailService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(EmailService.name);
  }

  async send(message: EmailMessage): Promise<void> {
    if (this.config.get('EMAIL_TRANSPORT') === 'unosend')
      return this.sendWithUnosend(message);
    this.logger.info(
      `Email (not sent, local only) to ${message.to}: ${message.subject}\n${message.text}`,
    );
  }

  private async sendWithUnosend(message: EmailMessage): Promise<void> {
    let status: number | undefined;
    try {
      const response = await fetch(
        `${this.config.get('UNOSEND_API_URL')}/emails`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.get('UNOSEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.config.get('EMAIL_FROM'),
            to: [message.to],
            subject: message.subject,
            text: message.text,
            tracking: { open: false, click: false },
          }),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        },
      );
      status = response.status;
      if (response.ok) return;
    } catch (cause) {
      this.logger.error({ err: cause }, 'Unosend could not be reached');
      throw new AppError(EMAIL_ERRORS.SEND_FAILED, { cause });
    }
    this.logger.error({ status }, 'Unosend refused the email');
    throw new AppError(EMAIL_ERRORS.SEND_FAILED);
  }
}
