interface Config {
    server: {
        port: number;
        host: string;
        nodeEnv: string;
    };
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    jwt: {
        secret: string;
        expiration: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
}
declare const config: Config;
export default config;
