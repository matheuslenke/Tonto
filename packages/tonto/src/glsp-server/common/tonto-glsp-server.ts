import { Args, ArgsUtil, DefaultGLSPServer, InitializeResult, Logger, MaybePromise } from "@eclipse-glsp/server";
import { inject, injectable } from "inversify";

@injectable()
export class TontoGLSPServer extends DefaultGLSPServer {
    MESSAGE_KEY = "message";
    TIMESTAMP_KEY = "timestamp";

    @inject(Logger)
    protected override logger!: Logger;

    protected override handleInitializeArgs(result: InitializeResult, args: Args | undefined): MaybePromise<InitializeResult> {
        if (!args) {
            return result;
        }
        const timestamp = ArgsUtil.get(args, this.TIMESTAMP_KEY);
        const message = ArgsUtil.get(args, this.MESSAGE_KEY);

        this.logger.debug(`${timestamp}: ${message}`);
        return result;
    }
}