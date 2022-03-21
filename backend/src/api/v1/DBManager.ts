import { IArangoIndexes } from "../../lms/types";
import { DataManager } from "./DataManager";

export abstract class DBManager<Type extends IArangoIndexes> extends DataManager<Type> {

}
