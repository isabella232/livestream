import {Request, Response} from 'express';

export class Router {
    constructor (app){
        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'Invalid URL'
                })
            });

        //new LeadRoutes(app);

    }
}