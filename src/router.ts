import {Request, Response} from 'express';

export class Router {
    constructor (app){
        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'Invalid URL'
                })
            });

        app.route('/z/')
            .get((req: Request, res: Response) => {
                res.sendFile(__dirname + '/static/index.html');
            });
    }
}