import * as express from 'express';
import { Router } from './router';
import {AppConfig} from "./appConfig";


class App {
    public app: express.Application;
    constructor() {
        this.app = express();
        new AppConfig(this.app);
        new Router(this.app);
    }
}
export default new App().app;
