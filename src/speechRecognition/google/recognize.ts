import {path as ffmpegPath} from '@ffmpeg-installer/ffmpeg';
import {ffmpeg} from 'fluent-ffmpeg';
import {Transform} from 'stream';
import * as speech from '@google-cloud/speech'
import * as chalk from 'chalk'


export class Recognize {
    private client: speech.v1p1beta1.SpeechClient;
    private request: any;
    private streamingLimit: number;

    private recognizeStream;

    private restartCounter: number;
    private audioInput: Array<any>;
    private lastAudioInput: Array<any>;;
    private resultEndTime: number;
    private isFinalEndTime: number;
    private finalRequestEndTime: number;
    private isNewStream: boolean;
    private bridgingOffset: number;
    private isLastTranscriptFinal: boolean;
    private dest : Transform;

    constructor (){
        this.recognizeStream = null;
        this.restartCounter = 0;
        this.audioInput = [];
        this.lastAudioInput = [];
        this.resultEndTime = 0;
        this.isFinalEndTime = 0;
        this.finalRequestEndTime = 0;
        this.isNewStream = true;
        this.bridgingOffset = 0;
        this.isLastTranscriptFinal = false;
        this.streamingLimit = 60000;
        this.client = new speech.v1p1beta1.SpeechClient();

        this.setDefaultRequest();
        ffmpeg.setFfmpegPath(ffmpegPath);
    }

    public setDefaultRequest(){
        this.request = {
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 16600,
                languageCode: 'en-US',
                enableWordTimeOffsets: true,
            },
            interimResults: true,
        };
    }

    public startStream(io){
        this.audioInput = [];
        this.recognizeStream = this.client
            .streamingRecognize(this.request)
            .on('error', err => {
                if (err.code === 11) {
                    // restartStream();
                } else {
                    console.error('API request error ' + err);
                }
            })
            .on('data', stream => this.speechCallback(stream,io));
        setTimeout(() => restartStream(io), this.streamingLimit);
    }

    public speechCallback(stream,io){
        this.resultEndTime =
            stream.results[0].resultEndTime.seconds * 1000 +
            Math.round(stream.results[0].resultEndTime.nanos / 1000000);

        const correctedTime =
            this.resultEndTime - this.bridgingOffset + this.streamingLimit * this.restartCounter;

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        let stdoutText = '';
        if (stream.results[0] && stream.results[0].alternatives[0]) {
            stdoutText =
                correctedTime + ': ' + stream.results[0].alternatives[0].transcript;
        }

        if (stream.results[0].isFinal) {
            process.stdout.write(chalk.blue(`${stdoutText}\n`));
            io.emit('NewText', stdoutText);

            this.isFinalEndTime = this.resultEndTime;
            this.isLastTranscriptFinal = true;
        } else {
            if (stdoutText.length > process.stdout.columns) {
                stdoutText =
                    stdoutText.substring(0, process.stdout.columns - 4) + '...';
            }
            process.stdout.write(chalk.red(`${stdoutText}`));

            this.isLastTranscriptFinal = false;
        }
    }

    public restartStream(io) {
        if (this.recognizeStream) {
            this.recognizeStream.removeListener('data', this.speechCallback);
            this.recognizeStream = null;
        }
        if (this.resultEndTime > 0) {
            this.finalRequestEndTime = this.isFinalEndTime;
        }
        this.resultEndTime = 0;

        this.lastAudioInput = [];
        this.lastAudioInput = this.audioInput;

        this.restartCounter++;

        if (!this.isLastTranscriptFinal) {
            process.stdout.write('\n');
        }
        process.stdout.write(
            chalk.yellow(`${this.streamingLimit * this.restartCounter}: RESTARTING REQUEST\n`)
        );

        this.isNewStream = true;

        this.startStream(io);
    }

    public updateDestinationStream(){
        this.dest = new Transform({
            transform: (chunk, encoding, callback) => {
                if (this.isNewStream && this.lastAudioInput.length !== 0) {

                    const chunkTime = this.streamingLimit / this.lastAudioInput.length;
                    if (chunkTime !== 0) {
                        if (this.bridgingOffset < 0) {
                            this.bridgingOffset = 0;
                        }
                        if (this.bridgingOffset > this.finalRequestEndTime) {
                            this.bridgingOffset = this.finalRequestEndTime;
                        }
                        const chunksFromMS = Math.floor(
                            (this.finalRequestEndTime - this.bridgingOffset) / chunkTime
                        );
                        this.bridgingOffset = Math.floor(
                            (this.lastAudioInput.length - chunksFromMS) * chunkTime
                        );

                        for (let i = chunksFromMS; i < this.lastAudioInput.length; i++) {
                            this.recognizeStream.write(this.lastAudioInput[i]);
                        }
                    }
                    this.isNewStream = false;
                }

                this.audioInput.push(chunk);

                if (this.recognizeStream) {
                    this.recognizeStream.write(chunk);
                }

                callback();
            },
        });
    }

    public startRecognizeStream (io:any, streamID:string, streamURL: string){
        ffmpeg(streamURL)
            .on('start', () => {
                this.startStream(io);
                this.updateDestinationStream();
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
                '-ar 16k',
                '-map_metadata -1'
            ])
            .output(this.dest)
            .run();
    }

}





