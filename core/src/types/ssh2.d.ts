declare module 'ssh2' {
  export class Client {
    connect(config: any): this;
    on(event: string, listener: (...args: any[]) => void): this;
    exec(command: string, callback: (err: Error | undefined, stream: any) => void): boolean;
    end(): void;
  }
  export interface ConnectConfig {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    privateKey?: Buffer | string;
    readyTimeout?: number;
    [key: string]: any;
  }
}
