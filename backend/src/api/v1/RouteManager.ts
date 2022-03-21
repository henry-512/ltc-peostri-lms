import Router from "@koa/router";
import { IArangoIndexes } from "../../lms/types";
import { DBManager } from "./DBManager";

export class RouteManager<Type extends IArangoIndexes> extends Router {
    
}
