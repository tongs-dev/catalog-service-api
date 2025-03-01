module.exports = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "test_user",
    password: process.env.DB_PASS || "password",
    database: process.env.DB_NAME || postgres,
    synchronize: false,
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: process.env.MIGRATION_PATH ? [process.env.MIGRATION_PATH] : ["dist/migration/**/*.js"],
    subscribers: ["src/subscriber/**/*.ts"]
};
