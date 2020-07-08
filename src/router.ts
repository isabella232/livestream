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

        // app.route('/live/:streamId').get((req: Request, res: Response) => {
        //     console.log("request stream id",req.param('streamId'))
        //     res.writeHead(302, {
        //         Location: 'rtmp://localhost:1935/live/' + req.param('streamId')
        //     });
        //     res.end(); 
        // });
            
    }
}