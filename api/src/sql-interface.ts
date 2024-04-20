type SelectorOptions = "NOT LIKE" | "LIKE" | ">" | "<" | "=" | "!=" | ">=" | "<=" | "<>" | "@";

type OrderOptions = "ASC" | "DESC";

export type KwargsWithOptionArray<Type> =
    Type |
    [SelectorOptions, Type] |
    [SelectorOptions, Type][] |
    ["@", [string, Type]];

export type KwargsWithOrder<Type> = null | [keyof Type, OrderOptions];

export interface SqlKwargs {
    [key: string]: KwargsWithOptionArray<any>;
}

export type KwargsOptionalMap<Type> = {
    [Property in keyof Type]?: KwargsWithOptionArray<Type[Property]>;
}

export type KwargsRequiredMap<Type> = {
    [Property in keyof Type]: KwargsWithOptionArray<Type[Property]>;
}

export interface TblPrice {
    brand: string;
    size: string;
    shell: string;
    features: number;
    price: number;
    hash: string;
}

export interface TblInventory {
    id: number;
    type: string;
    sold: number;
}

type SqlSelect<Type> = (kwargs: KwargsOptionalMap<Type>, order?: KwargsWithOrder<Type>) => Type[];

type SqlReplace<Type> = (kwargs: KwargsRequiredMap<Type>) => void;

type SqlDelete<Type> = (kwargs: KwargsOptionalMap<Type>) => void;

type SqlCount<Type> = (kwargs: KwargsOptionalMap<Type>) => number;

export type KwargsAsAny<Type> =
    SqlSelect<Type> |
    SqlReplace<Type> |
    SqlDelete<Type> |
    SqlCount<Type>;

interface SqlMap {
    Price: TblPrice;
    Inventory: TblInventory;
};

export type AnyMap = {
    [Table in keyof SqlMap]: KwargsAsAny<SqlMap[Table]>;
}

export type SelectMap = {
    [Table in keyof SqlMap]: SqlSelect<SqlMap[Table]>;
}

export type ReplaceMap = {
    [Table in keyof SqlMap]: SqlReplace<SqlMap[Table]>;
}

export type CountMap = {
    [Table in keyof SqlMap]: SqlCount<SqlMap[Table]>;
}

export type DeleteMap = {
    [Table in keyof SqlMap]: SqlDelete<SqlMap[Table]>;
}

export interface PublicMap {
    "replace": ReplaceMap,
    "select": SelectMap,
    "delete": DeleteMap,
    "count": CountMap,
}

