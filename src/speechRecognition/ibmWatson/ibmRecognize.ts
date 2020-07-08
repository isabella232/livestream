import { IamAuthenticator } from 'ibm-watson/auth';
import * as SpeechToTextV1 from 'ibm-watson/speech-to-text/v1';
import * as GeneratedSpeechToTextV1 from 'ibm-watson/speech-to-text/v1-generated';
import * as FfmpegCommand from 'fluent-ffmpeg';
import {Duplex} from 'stream';
import * as chalk from 'chalk';

const fs = require('fs');
const ibmAPIKey = `${process.env.IBM_API_KEY}`;
const ibmAPIUrl = `${process.env.IBM_API_URL}`;
const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({ apikey: ibmAPIKey, disableSslVerification: true }),
    version: '2019-02-01',
    url: ibmAPIUrl,
    disableSslVerification: true
});


export class IBMRecognize {
    private io: any;
    private speechRecognitionResults : GeneratedSpeechToTextV1.SpeechRecognitionResults;
    private stream: Duplex;

    constructor() {
        this.initStreamingClient();
    }

    public initStreamingClient(){
        var params = {
            objectMode: true,
            contentType: 'audio/flac',
            model: 'en-US_BroadbandModel',
            maxAlternatives: 3,
            interimResults: true,
            keywords: ['PC', 'Municipality', 'MAC'],
            keywordsThreshold: 0.5,
            endOfPhraseSilenceTime: 0.8,
            inactivityTimeout: -1
          };
        
          this.stream = speechToText.recognizeUsingWebSocket(params);
          this.stream.on('data', data => { 
            this.speechRecognitionResults = data;
            if (this.speechRecognitionResults.results && this.speechRecognitionResults.results.length > 0) {
                this.speechRecognitionResults.results.forEach((result) => {
                    if (result.final && result.alternatives[0]) {
                        console.log("=========", JSON.stringify(data,null, 2));
                        let finalText = result.alternatives[0].transcript;
                        process.stdout.write(chalk.red(`${finalText}\n`));
                        this.io.emit('NewText_1', finalText);
                    }
                });
            }
          });
          this.stream.on('error', function(event) { });
          this.stream.on('close', function(event) { });
    }

    public startRecognizeStream (io: any, streamURL: string){
        this.io = io;
        FfmpegCommand(streamURL)
            .on('start', () => {
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
            .on('stderr', function(stderrLine) {
                console.log('Stderr output: ' + stderrLine);
            })
            .outputOptions([
                '-f flac',
                '-af highpass=300, lowpass=4000',
                '-acodec flac',
                '-vn',
                '-ac 1',
                '-ar 16k',
                '-map_metadata -1'
            ])
            .output(this.stream)
            .run();
    }
}

function onEvent(name, event) {
    console.log(name, JSON.stringify(event, null, 2));
};