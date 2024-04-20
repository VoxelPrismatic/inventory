import * as sqlite3 from "better-sqlite3";
import * as path from "path";
import * as Sql from "./sql-interface";

let db: sqlite3.Database;
const db_path = path.join(__dirname, "..", "data", "inventory.db");
console.log("\x1b[94;1m<DB>\x1b[0m @ " + db_path)

try {
    db = new sqlite3(db_path, { fileMustExist: true });
} catch(err) {
    db = new sqlite3(db_path);
    db.exec(`
CREATE TABLE "Inventory" (
    "id"    INTEGER NOT NULL,
    "type"  TEXT NOT NULL,
    "sold"  INTEGER NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Price" (
    "brand"     TEXT NOT NULL,
    "size"      TEXT NOT NULL,
    "shell"     TEXT NOT NULL,
    "features"  INTEGER NOT NULL,
    "price"     INTEGER NOT NULL,
    "hash"      TEXT NOT NULL,
    PRIMARY KEY("brand","size","shell","features")
);
`);
}

db.pragma("journal_mode = WAL");

function load_kwargs<Type>(table: string, fn: any): Sql.KwargsAsAny<any> {
    return (kwargs: Type, order: string[] = []) => fn(table, kwargs, order);
}

function load_map(
        fn: typeof db_select_kwargs | typeof db_replace_kwargs | typeof db_count_kwargs,
): Sql.AnyMap {
    return {
        "Inventory": load_kwargs("Inventory", fn),
        "Price": load_kwargs("Price", fn),
    }
}

export const sql: Sql.PublicMap = {
    "replace": (load_map(db_replace_kwargs) as Sql.ReplaceMap),
    "select": (load_map(db_select_kwargs) as Sql.SelectMap),
    "delete": (load_map(db_delete_kwargs) as Sql.DeleteMap),
    "count": (load_map(db_count_kwargs) as Sql.CountMap),
};

function handle_kwargs(kwargs: Sql.SqlKwargs): [string, any[]] {
    const params: any[] = [];
    const which: string[] = [];
    for(var key of Object.keys(kwargs)) {
        if(!Array.isArray(kwargs[key])) {
            kwargs[key] = [["=", kwargs[key]]];
        } else if(!Array.isArray(kwargs[key][0])) {
            kwargs[key] = [kwargs[key]];
        }

        for(var [options, value] of kwargs[key]) {
            if(options === "@") {
                which.push(value[0]);
                let count: number = Array.from(value[0].matchAll(/\?/g)).length;
                params.push(...Array(count).fill(value[1]));
            } else {
                which.push(`\`${key}\` ${options} ?`);
                params.push(value);
            }
        }
    }
    // console.warn("\x1b[94;1m" + which.join(" AND ") + "\x1b[0m", params);
    return [which.join(" AND "), params];
}

function db_select_kwargs(table: string, kwargs: Sql.SqlKwargs, order: string[] = []) {
    const [which, params] = handle_kwargs(kwargs);
    let query: string = `SELECT * FROM \`${table}\` WHERE ${which}`;
    if(order.length > 0)
        query += ` ORDER BY ${order[0]} ${order[1]}`;
    return db_query(query, params);
}

function db_replace_kwargs(table: string, kwargs: Sql.SqlKwargs, ..._: any[]): void {
    const params: any[] = Object.values(kwargs);
    const which: string = "`" + Object.keys(kwargs).join("`, `") + "`";
    const qmark: string = Object.keys(kwargs).map(() => ("?")).join(", ");
    db_exec(`REPLACE INTO ${table} (${which}) VALUES (${qmark})`, params);
}

function db_count_kwargs(table: string, kwargs: Sql.SqlKwargs, ..._: any[]): number {
    const [which, params] = handle_kwargs(kwargs);
    return db_query(`SELECT COUNT(*) FROM \`${table}\` WHERE ${which}`, params)[0]["COUNT(*)"];
}

function db_delete_kwargs(table: string, kwargs: Sql.SqlKwargs, ..._: any[]): void {
    const [which, params] = handle_kwargs(kwargs);
    db_exec(`DELETE FROM \`${table}\` WHERE ${which}`, params);
}

function db_query(query: string, params: any[] = []): any[] {
    // console.log("\x1b[91;1m" + query + "\x1b[0m", params);
    return db.prepare(query).all(params);
}


function db_exec(query: string, params: any[] = []) {
    return db.prepare(query).run(params);
}
