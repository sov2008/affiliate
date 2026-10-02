declare module 'ssh2' {
  export interface SFTPWrapper {
    fastPut(localPath: string, remotePath: string, callback: (err?: Error) => void): void;
    fastGet(remotePath: string, localPath: string, callback: (err?: Error) => void): void;
    readdir(location: string, callback: (err: Error | undefined, list: any[]) => void): void;
    mkdir(path: string, callback: (err?: Error) => void): void;
    unlink(path: string, callback: (err?: Error) => void): void;
    end(): void;
    [key: string]: any;
  }

  export class Client {
    connect(config: ConnectConfig): this;
    on(event: string, listener: (...args: any[]) => void): this;
    exec(command: string, callback: (err: Error | undefined, stream: any) => void): boolean;
    sftp(callback: (err: Error | undefined, sftp: SFTPWrapper) => void): boolean;
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

declare module 'prompts';
