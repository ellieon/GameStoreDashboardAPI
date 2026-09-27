import express, { Express, Request, Response } from 'express';
import { Server } from 'http';
import * as sampleResponseAberdeen from '../../data/store-api-sample-query-aberdeen-gc-ds.json' with { type: 'json' };
import * as sampleResponseProductLines from '../../data/store-api-sample-product-lines.json' with { type: 'json' };
import * as sampleResponseStores from '../../data/store-api-sample-stores.json' with { type: 'json' };

export class MockStoreServer {
    private app: Express;
    private server?: Server;
    private rejectNext: boolean = false;

    constructor(private readonly port: number) {
        this.app = express();
        this.app.use(express.json());

        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.app.post('/', (_req: Request, res: Response) => {
            
            res.json(sampleResponseAberdeen);
        });

        this.app.get('/productlines', (_req: Request, res: Response) => {

            res.json(sampleResponseProductLines);
        });

        this.app.get('/stores', (_req: Request, res: Response) => {

            res.json(sampleResponseStores);
        });
    }

    async start(): Promise<void> {
        await new Promise<void>((resolve) => {
            this.server = this.app.listen(this.port, () => resolve());
        });
    }

    async stop(): Promise<void> {
        if (!this.server) {
            return;
        }

        await new Promise<void>((resolve, reject) => {
            this.server?.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }
}