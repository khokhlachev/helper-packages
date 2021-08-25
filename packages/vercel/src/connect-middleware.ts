import { IncomingMessage, OutgoingMessage } from "http";

type Middleware = <I extends IncomingMessage, O extends OutgoingMessage>(
  req: I,
  res: O,
  callback: (result: any) => void
) => void;

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export default function connectMiddleware(middleware: Middleware) {
  return <I extends IncomingMessage, O extends OutgoingMessage>(
    req: I,
    res: O
  ) =>
    new Promise((resolve, reject) => {
      middleware<I, O>(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}
