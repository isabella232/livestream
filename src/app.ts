import * as express from 'express';
import { Router } from './router';
import {AppConfig} from "./appConfig";
import {MediaServer} from "./mediaServer";


class App {
    public app: express.Application;
    constructor() {
        this.app = express();
        new AppConfig(this.app);
        new Router(this.app);
        new MediaServer().startMediaServer();
    }
}
export default new App().app;
