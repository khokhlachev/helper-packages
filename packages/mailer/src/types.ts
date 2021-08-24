export type AnyObject = Record<string, any>;

export interface MailerConfig {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
}
export abstract class BaseTransport {
  abstract send(config: MailerConfig, body?: AnyObject): Promise<void>;
}
