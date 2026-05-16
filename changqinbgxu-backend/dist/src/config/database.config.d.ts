export declare const databaseConfig: (() => {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean | {
        rejectUnauthorized: boolean;
        ca?: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean | {
        rejectUnauthorized: boolean;
        ca?: string;
    };
}>;
