import * as NodeMediaServer from 'node-media-server';
const Ffmpeg = require('@ffmpeg-installer/ffmpeg');

export class MediaServer {
    private config:any;
    private nms: NodeMediaServer;

    constructor() {
        this.setDefaultConfig();
        this.nms = new NodeMediaServer(this.config);
    }

    private setDefaultConfig(){
        this.setConfig({
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60
            },
            http: {
                port: 8000,
                mediaroot: './media',
                allow_origin: '*'
            },
            trans: {
                ffmpeg: Ffmpeg.path,
                tasks: [
                    {
                        app: 'live',
                        vc: "copy",
                        vcParam: [],
                        ac: "aac",
                        acParam: ['-ab', '64k', '-ac', '1', '-ar', '16000'],
                        rtmp:true,
                        rtmpApp:'live2',
                        hls: true,
                        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                        dash: true,
                        dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
                    }
                ]
            }
        });
    }

    public setConfig(config:any){
        this.config = config;
    }

    public startMediaServer(){
        this.nms.run();
    }
}
