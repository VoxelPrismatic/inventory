import Fastify from "fastify";
import FastifyVite from "@fastify/vite"
import FastifyMultipart from "@fastify/multipart";
import cors from "@fastify/cors";
import * as path from "path";

const app = Fastify({ logger: true });
const port: number = 4500;

app.register(cors, {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
});

app.register(FastifyMultipart);

app.register(require("./router"));

app.get("/", async (req, reply) => {
    return reply.html();
});

async function start() {
    await app.register(FastifyVite, {
        root: path.join(__dirname, "..", "frontend"),
        dev: true,
        prefix: "/",
        spa: true,
    });
    console.log("<<<");
    await app.vite.ready();
    console.log("...");
    try {
        await app.listen({ port: port, host: "0.0.0.0"});
    } catch(err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();


