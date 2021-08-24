import crypto from "crypto";
import mcClient from "@mailchimp/mailchimp_marketing";
import { createError } from "@khokhlachev/utils";
import { BaseTransport } from "./types";

const error = createError("MailchimpTransport");

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

const md5 = (data: string) =>
  crypto.createHash("md5").update(data).digest("hex");

type RequestBody = { email: string };

export class MailchimpTransport<T extends RequestBody>
  implements BaseTransport
{
  private readonly mc: typeof mcClient;
  private readonly listId: string;

  constructor(apiKey?: string, listId?: string) {
    const _apiKey = apiKey ?? MAILCHIMP_API_KEY;

    const options: mcClient.Config = {
      apiKey: _apiKey ?? error("apiKey parameter is missing"),
      server: _apiKey?.split("-")[1],
    };

    this.listId =
      listId ?? MAILCHIMP_LIST_ID ?? error("listId parameter is missing");

    mcClient.setConfig(options);
    this.mc = mcClient;
  }

  async send(_, { email }: T) {
    await this.mc.lists.setListMember(this.listId, md5(email.toLowerCase()), {
      email_address: email,
      status_if_new: "subscribed" as any,
    });
  }
}
