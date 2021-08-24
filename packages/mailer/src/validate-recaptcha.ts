import { createError } from "@khokhlachev/utils";

const error = createError("validateReCaptcha");

export async function validateReCaptcha(token: string, secret?: string) {
  const _secret =
    secret ??
    process.env.RECAPTCHA_SECRET_KEY ??
    error("secret key is missing");

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: new URLSearchParams([
      ["secret", _secret],
      ["response", token],
    ]),
  }).catch((err) => {
    error(`Request has failed. ${err}`);
  });

  if (res) {
    const json = await res.json();

    if (!json.success) {
      error(
        `Request is OK, but verification has failed. ${
          json?.["error-codes"]?.[0] ?? ""
        }`
      );
    }
  }

  return true;
}
