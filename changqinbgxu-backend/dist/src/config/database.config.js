"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const config_1 = require("@nestjs/config");
function buildMysqlSsl() {
    if (process.env.DB_SSL !== 'true') {
        return undefined;
    }
    if (process.env.DB_SSL_CA) {
        return {
            rejectUnauthorized: true,
            ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'),
        };
    }
    return { rejectUnauthorized: false };
}
exports.databaseConfig = (0, config_1.registerAs)('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'changqingxu',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: buildMysqlSsl(),
}));
//# sourceMappingURL=database.config.js.map