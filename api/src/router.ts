import * as Fastify from "fastify";
import { sql } from "./database";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";
import { ERRORS, ErrorObject } from "./errors";
import * as sharp from "sharp";

interface Kwargs {
    [key: string]: any;
}

interface PriceHash {
    price: number | null;
    hash: string;
}

interface DetailsHash {
    brand: string;
    size: string;
    shell: string;
    features: number;
    price: number;
    hash: string;
}

interface LuggageDetails extends DetailsHash {
    id: number;
    sold: boolean;
}

async function new_price(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<DetailsHash | ErrorObject> {
    const params: Kwargs = (req.query as Kwargs);
    if(params.brand === undefined || params.size === undefined || params.shell === undefined || params.features === undefined || params.price === undefined) {
        reply.code(400);
        return ERRORS.MISSING_PARAMETER;
    }
    const hash = (crypto.createHash("sha256").update(params.brand + ":" + params.size + ":" + params.shell + ":" + params.features).digest("hex"));
    const ret = {
        brand: params.brand,
        size: params.size,
        shell: params.shell,
        features: params.features,
        price: params.price,
        hash: hash,
    }
    sql.replace.Price(ret);
    return ret;
}

async function get_price_or_null(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<PriceHash | ErrorObject> {
    const params: Kwargs = (req.query as Kwargs);
    if(params.brand === undefined || params.size === undefined || params.shell === undefined || params.features === undefined) {
        return {
            price: null,
            hash: "",
        }
    }
    const hash = (crypto.createHash("sha256").update(params.brand + ":" + params.size + ":" + params.shell + ":" + params.features).digest("hex"));
    const result = sql.select.Price({ hash: hash });
    if(result.length === 0) {
        return {
            price: null,
            hash: hash,
        }
    }
    return {
        price: result[0].price,
        hash: hash,
    }
}

async function get_price(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<DetailsHash | ErrorObject> {
    const params: Kwargs = (req.params as Kwargs);
    if(params.hash === undefined) {
        reply.code(400);
        return ERRORS.MISSING_PARAMETER;
    }
    return sql.select.Price({ hash: params.hash })[0];
}

async function new_luggage(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<LuggageDetails | ErrorObject> {
    const params: Kwargs = (req.params as Kwargs);
    if(params.hash === undefined) {
        reply.code(400);
        return ERRORS.HASH_NOT_FOUND;
    }

    const luggage_id = Date.now();

    const img = await req.file();
    if(img === undefined) {
        reply.code(400);
        return ERRORS.NO_IMAGE;
    }
    const img_data = await img.toBuffer();
    sharp(img_data).webp().toFile(path.join(__dirname, "..", "data", "images", luggage_id + ".webp"));

    sql.replace.Inventory({
        id: luggage_id,
        type: params.hash,
        sold: 0,
    });

    return {
        id: luggage_id,
        ...sql.select.Price({ hash: params.hash })[0],
        sold: false,
    }
}

async function get_luggage(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<LuggageDetails | ErrorObject> {
    const params: Kwargs = (req.params as Kwargs);
    if(params.id === undefined) {
        reply.code(400);
        return ERRORS.ID_NOT_FOUND;
    }

    const result = sql.select.Inventory({ id: params.id });
    if(result.length === 0) {
        reply.code(404);
        return ERRORS.ID_NOT_FOUND;
    }

    return {
        id: result[0].id,
        ...sql.select.Price({ hash: result[0].type })[0],
        sold: Boolean(result[0].sold),
    }
}

async function luggage_sold(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<LuggageDetails | ErrorObject> {
    const params: Kwargs = (req.params as Kwargs);
    if(params.id === undefined) {
        reply.code(400);
        return ERRORS.ID_NOT_FOUND;
    }

    const result = sql.select.Inventory({ id: params.id });
    if(result.length === 0) {
        reply.code(404);
        return ERRORS.ID_NOT_FOUND;
    }

    sql.replace.Inventory({
        id: params.id,
        type: result[0].type,
        sold: 1,
    });

    return {
        id: result[0].id,
        ...sql.select.Price({ hash: result[0].type })[0],
        sold: true,
    }
}

async function luggage_unsold(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<LuggageDetails | ErrorObject> {
    const params: Kwargs = (req.params as Kwargs);
    if(params.id === undefined) {
        reply.code(400);
        return ERRORS.ID_NOT_FOUND;
    }

    const result = sql.select.Inventory({ id: params.id });
    if(result.length === 0) {
        reply.code(404);
        return ERRORS.ID_NOT_FOUND;
    }

    sql.replace.Inventory({
        id: params.id,
        type: result[0].type,
        sold: 0,
    });

    return {
        id: result[0].id,
        ...sql.select.Price({ hash: result[0].type })[0],
        sold: false,
    }
}

async function luggage_img(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<fs.ReadStream | ErrorObject> {
    const params: Kwargs = (req.params as Kwargs);
    if(params.id === undefined) {
        reply.code(400);
        return ERRORS.ID_NOT_FOUND;
    }

    const img_path = path.join(__dirname, "..", "data", "images", params.id + ".webp");
    if(!fs.existsSync(img_path)) {
        reply.code(404);
        return ERRORS.ID_NOT_FOUND;
    }
    const stream = fs.createReadStream(img_path);
    return await reply.send(stream);
}

async function inventory_here(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<number[]> {
    const result = sql.select.Inventory({ sold: 0 }, ["id", "DESC"]);
    return result.map((x) => x.id);
}

async function inventory_sold(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<number[]> {
    const result = sql.select.Inventory({ sold: 1 }, ["id", "DESC"]);
    return result.map((x) => x.id);
}

async function inventory_all(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<number[]> {
    const result = sql.select.Inventory({ id: [">", 0] }, ["id", "DESC"]);
    return result.map((x) => x.id);
}

async function brands(
        req: Fastify.FastifyRequest,
        reply: Fastify.FastifyReply
): Promise<string[]> {
    const result = sql.select.Price({ brand: ["NOT LIKE", ""] });
    // return unique brands only; no repeats
    return Array.from(new Set(result.map((x) => x.brand)));
}

export default async function(app: Fastify.FastifyInstance, opts: any) {
    app.get("/api/price/new", new_price);
    app.get("/api/price/get", get_price_or_null);
    app.get("/api/price/:hash", get_price);

    app.post("/api/luggage/new/:hash", new_luggage);
    app.get("/api/luggage/:id", get_luggage);
    app.get("/api/luggage/:id/img.webp", luggage_img);
    app.get("/api/luggage/:id/mark/sold", luggage_sold);
    app.get("/api/luggage/:id/mark/unsold", luggage_unsold);

    app.get("/api/inventory", inventory_here);
    app.get("/api/inventory/sold", inventory_sold);
    app.get("/api/inventory/all", inventory_all);

    app.get("/api/brands", brands);

    app.get("/api/features", (req, reply) => {
        return {
            1: "USB",
            2: "Lock",
            4: "Front Pocket",
        }
    })
}
