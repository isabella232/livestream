import {path as ffmpegPath} from '@ffmpeg-installer/ffmpeg';
import * as FfmpegCommand from 'fluent-ffmpeg';
import {Duplex} from 'stream';
import { RevAiStreamingClient, AudioConfig } from 'revai-node-sdk';
import * as chalk from 'chalk';
import {properties} from '../../config/properties';
const fs = require('fs');




export class Recognize {
    private token: string;
    private audioConfig: AudioConfig;
    private client: RevAiStreamingClient;
    private io: any;
    private stream: Duplex;

    constructor(){
        this.setDefaultAudioConfig();
        this.setAccessToken(properties.revAIToken);
        this.initStreamingClient(this.token,this.audioConfig);
        this.initStream();
        FfmpegCommand.setFfmpegPath(ffmpegPath);
    }

    public setAccessToken(token:string){
        this.token = token
    }

    public initStreamingClient(token, audioConfig){
        this.client = new RevAiStreamingClient(token, audioConfig);
        this.client.on('close', (code, reason) => {
            console.log(`Connection closed, ${code}: ${reason}`);
        });
        this.client.on('httpResponse', code => {
            console.log(`Streaming client received http response with code: ${code}`);
        })
        this.client.on('connectFailed', error => {
            console.log(`Connection failed with error: ${error}`);
        })
        this.client.on('connect', connectionMessage => {
            console.log(`Connected with job id: ${connectionMessage.id}`);
        });
    }

    public setSocketIO(io){
        this.io = io;
    }

    public initStream(){
        this.stream = this.client.start()
        this.stream.on('data', data => {
            this.getTranscription(data);
        });

        this.stream.on('end', () => {
            console.log("End of Stream");
        });
    }

    public setDefaultAudioConfig(){
        this.setAudioConfig(new AudioConfig(
            "audio/x-raw",
            "interleaved",
            16000,
            "S16LE",
            1
        ))
    }

    public setAudioConfig(audioConfig:AudioConfig){
        this.audioConfig = audioConfig;
    }

    public getTranscription(data){
        let finalText = "";
        if (data.type === 'final') {
            try {
                let elements = data.elements;
                if(elements.length > 0) {
                    for (let i = 0; i < elements.length; i++) {
                        let element = elements[i];
                        if (element.type === 'text') {
                            finalText += element.value+" "
                        }
                    }
                }

                if(finalText !== ""){
                    process.stdout.write(chalk.red(`${finalText}\n`));
                    console.log("Sending via SOCKET");
                    this.io.emit('NewText_1',finalText);
                }
            }catch (e) {
                console.error(e);
                console.log(data);
            }
        }
    }

    public startRecognizeStream (io:any, streamID:string, streamURL: string){
        FfmpegCommand(streamURL)
            .on('start', () => {
                this.setSocketIO(io);
                console.log("ffmpeg : processing Started");
            })
            .on('progress', (progress) => {
                console.log('ffmpeg : Processing: ' + progress.targetSize + '   KB converted');
            })
            .on('end', () => {
                console.log('ffmpeg : Processing finished !');
            })
            .on('error', (err) => {
                console.log('ffmpeg : ffmpeg error :' + err.message);
            })
            .outputOptions([
                '-f s16le',
                '-acodec pcm_s16le',
                '-vn',
                '-ac 1',
                '-ar 8k',
                '-map_metadata -1'
            ])
            .output(this.stream)
            .run();
    }
}