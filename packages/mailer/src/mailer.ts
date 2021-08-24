import { BaseTransport, MailerConfig, AnyObject } from "./types";
import { ValidationError, AnyObjectSchema } from "yup";

function stringifyYupValidationError(err: ValidationError) {
  return err.inner.reduce(
    (errors: { [k: string]: string[] }, curr: ValidationError) => {
      if (Array.isArray(errors[curr.path!])) {
        errors[curr.path!].push(curr.message);
      } else {
        errors[curr.path!] = [curr.message];
      }

      return errors;
    },
    {}
  );
}

type MailOptions<T extends AnyObject> = {
  transport: BaseTransport;
  schema: AnyObjectSchema;
  formatMessage?: (body: T) => string;
};

const defaultFormatMessage = <T>(obj: T) => {
  return JSON.stringify(obj);
};

export class Mailer<T extends AnyObject> {
  private transport: BaseTransport;
  private schema: AnyObjectSchema;
  private formatMessage: (body: T) => string;

  constructor(options: MailOptions<T>) {
    this.transport = options.transport;
    this.schema = options.schema;
    this.formatMessage = options.formatMessage || defaultFormatMessage;
  }

  public async validate(body: T): Promise<T> {
    const ownKeys = Object.keys(body) as (keyof T)[];
    for (const k of ownKeys) {
      const v = body[k];

      if (typeof v === "string") {
        body[k] = v.replace(/(<([^>]+)>)/g, "").trim();
      }
    }

    return this.schema
      .validate(body, { abortEarly: false })
      .then(() => {
        return Promise.resolve(body);
      })
      .catch((err: ValidationError) => {
        return Promise.reject(stringifyYupValidationError(err));
      });
  }

  public async send(config: MailerConfig): Promise<void>;
  public async send(config: Omit<MailerConfig, "html">, body: T): Promise<void>;
  public async send(config: any, body?: T): Promise<void> {
    if (body) {
      config.html = this.formatMessage(body);
    }

    return await this.transport.send(config, body);
  }
}
