import { MailerConfig, BaseTransport } from "./types";
import { createError } from "@khokhlachev/utils";
import Mailgun from "mailgun-js";

const error = createError("MailgunTransport");

export class MailgunTransport implements BaseTransport {
  private readonly mg: ReturnType<typeof Mailgun>;

  constructor(domain?: string, apiKey?: string) {
    const options = {
      domain:
        domain ??
        process.env.MAILGUN_DOMAIN ??
        error("domain parameter is missing"),
      apiKey:
        apiKey ??
        process.env.MAILGUN_API_KEY ??
        error("apiKey parameter is missing"),
      host: "api.eu.mailgun.net",
    };

    this.mg = Mailgun(options);
  }

  public async send(config: MailerConfig) {
    await this.mg.messages().send(config);
  }
}
