import { APIError, HTTPStatus, IErrorable } from "../../lms/errors"
import { IFieldData, IForeignFieldData } from "../../lms/FieldData"

export abstract class DataManager<Type> extends IErrorable {
    private fieldEntries:[string, IFieldData][]
    private foreignEntries:[string, IForeignFieldData][]
    private parentField: null | {
        local:string, foreign:string
    }

    /**
     * Runs the passed function on each foreign key in the document
     */
    protected async mapForeignKeys(
        doc:Type,
        fn:(
            key:string,
            data:IForeignFieldData,
        ) => Promise<any>,
        skippable?:(
            data:IForeignFieldData,
        ) => boolean,
    ) : Promise<Type> {
        return this.forEachForeignKey(
            doc,
            async (p,k,d) => p.doc[p.key] = <any>await fn(k,d),
            async (p,a,d) => p.doc[p.key] = <any>await Promise.all(
                a.map(k => fn(k,d))
            ),
            async (p,o,d) => {
                let temp:any = {}
                for (let stepId in o) {
                    let stepArray = o[stepId]

                    if (!Array.isArray(stepArray)) {
                        throw this.error(
                            'mapForeignKeys',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${stepArray} is not an array`,
                        )
                    }
                    temp[stepId] = <any>await Promise.all(
                        stepArray.map(k => fn(k,d)
                    ))
                }
                p.doc[p.key] = temp
            },
            skippable
        )
    }

    protected async forEachForeignKey(
        doc:Type,
        // Runs for each foreign key
        keyCall:(
            pointer:{doc:any,key:string | number | symbol}, //doc:Type
            key:string,
            data:IForeignFieldData,
        ) => Promise<any>,
        // Runs for each foreign array
        arrCall:(
            pointer:{doc:any,key:string | number | symbol},
            arr:Array<string>,
            data:IForeignFieldData,
        ) => Promise<any>,
        // Runs for each foreign step object
        stpCall:(
            pointer:{doc:any,key:string | number | symbol},
            stp:{[index:string]:Array<string>},
            data:IForeignFieldData,
        ) => Promise<any>,
        skippable?:(
            data:IForeignFieldData,
        ) => boolean,
    ) : Promise<Type> {
        for (let [fkey, data] of this.foreignEntries) {
            if (skippable && skippable(data)) continue

            if (!(fkey in doc)) {
                if (data.optional) {
                    console.warn(`Optional foreign key [${fkey}] dne`)
                    continue
                }
                throw this.error(
                    'forEachForeignKey',
                    HTTPStatus.BAD_REQUEST,
                    'Missing field',
                    `Foreign field [${fkey}] dne in [${JSON.stringify(doc)}]`
                )
            }

            // key of doc pointing to a foreign object
            let local = fkey as keyof Type
            // An array, string, or step object representing the foreign keys
            let foreign = doc[local]

            switch (data.type) {
                // Single foreign key
                case 'fkey':
                    await keyCall({doc,key:local},<any>foreign,data)
                    continue
                // Foreign key array
                case 'fkeyArray':
                    if (!Array.isArray(foreign)) {
                        throw this.error(
                            'forEachForeignKey',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${JSON.stringify(foreign)} was expected to be an array`
                        )
                    }
                    await arrCall({doc,key:local},foreign,data)
                    continue
                // Foreign key step object
                case 'fkeyStep':
                    if (typeof foreign !== 'object') {
                        throw this.error(
                            'forEachForeignKey',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${JSON.stringify(foreign)} was expected to be a step object`
                        )
                    }
                    await stpCall({doc,key:local},<any>foreign,data)
                    continue
                default:
                    throw this.internal(
                        'forEachForeignKey',
                        `${JSON.stringify(data)} has invalid .type field (expected foreign key)`
                    )
            }
        }

        return doc
    }

    constructor(
        routeName: string,
        className: string,
        fieldData: {[key:string]: IFieldData},
        /**
         * Create/Update timestamp
         */
        protected hasCUTimestamp: boolean,
    ) {
        super(className)

        if (this.hasCUTimestamp) {
            fieldData['createdAt'] = {type:'string'}
            fieldData['updatedAt'] = {type:'string'}
        }

        this.fieldEntries = Object.entries(fieldData)
        this.foreignEntries = []
        this.parentField = null

        for (let [key, data] of this.fieldEntries) {
            if (data.foreignApi) {
                this.foreignEntries.push([key, data as IForeignFieldData])
            }
            if (data.parentReferenceKey) {
                this.parentField = {
                    local: key,
                    foreign: data.parentReferenceKey,
                }
            }
        }
    }
}
