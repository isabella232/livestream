import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as cookieSession from 'cookie-session';
import * as morgan from 'morgan';
import {properties} from './config/properties';

export class AppConfig {
    public constructor(app){
        app.use(morgan('dev'));
        app.use(bodyParser.json());
        app.use(cors());
        app.use(cookieParser());
        app.use(cookieSession({
            name: 'session',
            keys: [properties.sessionKey]
        }));
    }
}

