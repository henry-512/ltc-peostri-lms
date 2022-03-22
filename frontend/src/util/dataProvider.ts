import { stringify } from 'query-string';
import { fetchUtils, DataProvider } from 'ra-core';
import { IModule, IModuleStep, IProject } from './types';

/**
 * Maps react-admin queries to a simple REST API
 *
 * This REST dialect is similar to the one of FakeRest
 *
 * @see https://github.com/marmelab/FakeRest
 *
 * @example
 *
 * getList     => GET http://my.api.url/posts?sort=['title','ASC']&range=[0, 24]
 * getOne      => GET http://my.api.url/posts/123
 * getMany     => GET http://my.api.url/posts?filter={id:[123,456,789]}
 * update      => PUT http://my.api.url/posts/123
 * create      => POST http://my.api.url/posts
 * delete      => DELETE http://my.api.url/posts/123
 *
 * @example
 *
 * import * as React from "react";
 * import { Admin, Resource } from 'react-admin';
 * import simpleRestProvider from 'ra-data-simple-rest';
 *
 * import { PostList } from './posts';
 *
 * const App = () => (
 *     <Admin dataProvider={simpleRestProvider('http://path.to.my.api/')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */

type HTTPClientPromiseReturn = {
    headers: Headers,
    json: any
}

const client = (url: any, options: fetchUtils.Options = {}) => {
    options.credentials = 'include'
    return fetchUtils.fetchJson(url, options);
}

const dataProvider = (
    apiUrl: string,
    httpClient = client,
    countHeader: string = 'Content-Range'
): DataProvider => ({
    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const rangeStart = (page - 1) * perPage;
        const rangeEnd = page * perPage - 1;

        // Stringify on the sort/range fields destroys the
        // parsability of the query
        // "sort":"[\"id\",\"ASC\"]" is not exactly ideal
        const query = {
            sort: [field, order],
            range: [rangeStart, rangeEnd],
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        const options =
            countHeader === 'Content-Range'
                ? {
                    // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
                    headers: new Headers({
                        Range: `${resource}=${rangeStart}-${rangeEnd}`,
                        "Access-Control-Allow-Credentials": "include"
                    })
                }
                : {
                    headers: {
                        "Access-Control-Allow-Credentials": "include"
                    }
                };

        return httpClient(url, options).then(({ headers, json }: HTTPClientPromiseReturn) => {
            if (!headers.has(countHeader)) {
                throw new Error(
                    `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
                );
            }

            return {
                data: json,
                total:
                    countHeader === 'Content-Range'
                        ? parseInt((headers.get('content-range') || "").split('/').pop() || "", 10)
                        : parseInt(headers.get(countHeader.toLowerCase()) || ""),
            };
        });
    },

    getOne: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        })),

    getMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        return httpClient(url).then(({ json }) => ({ data: json }));
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const rangeStart = (page - 1) * perPage;
        const rangeEnd = page * perPage - 1;

        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        const options =
            countHeader === 'Content-Range'
                ? {
                    // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
                    headers: new Headers({
                        Range: `${resource}=${rangeStart}-${rangeEnd}`,
                    }),
                }
                : {};

        return httpClient(url, options).then(({ headers, json }: HTTPClientPromiseReturn) => {
            if (!headers.has(countHeader)) {
                throw new Error(
                    `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
                );
            }
            return {
                data: json,
                total:
                    countHeader === 'Content-Range'
                        ? parseInt((headers.get('content-range') || "").split('/').pop() || "", 10)
                        : parseInt(headers.get(countHeader.toLowerCase()) || ""),
            };
        });
    },

    update: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json })),

    // simple-rest doesn't handle provide an updateMany route, so we fallback to calling update n times instead
    updateMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(params.data),
                })
            )
        ).then(responses => ({ data: responses.map(({ json }) => json.id) })),

    create: async (resource, params) => {
        switch(resource) {
            case 'projects':
                let formData = new FormData();

                for (let step of Object.values<IModule[]>(params.data.modules)) {
                    for (let module of step) {
                        if (!module.waive_module_file && !module.files) continue;

                        if (module.waive_module_file) {
                            formData.append(`${module.id}-${module.waive_module_file.title}`, module.waive_module_file.rawFile)
                            module.waive_module_file = `${module.id}-${module.waive_module_file.title}`
                            console.log(module.waive_module_file)
                        }

                        if (module.files) {
                            if (module.files.length) {
                                for (let file of module.files) {
                                    formData.append(`${module.id}-${file.title}`, file.rawFile)
                                    file = `${module.id}-${file.title}`
                                }
                            } else {
                                formData.append(`${module.id}-${module.files.title}`, module.files.rawFile)
                                module.files = `${module.id}-${module.files.title}`
                            }
                        }
                    }
                }

                let jsonData = new Blob([JSON.stringify(params.data)], {
                    type: 'application/json'
                })

                formData.append('json', jsonData, "data");

                return httpClient(`${apiUrl}/${resource}`, {
                    method: 'POST',
                    body: formData,
                }).then(({ json }) => ({
                    data: { ...params.data, id: json.id },
                }))
                break;
            default: 
                return httpClient(`${apiUrl}/${resource}`, {
                    method: 'POST',
                    body: JSON.stringify(params.data),
                }).then(({ json }) => ({
                    data: { ...params.data, id: json.id },
                }))
                break;
        }
    },

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
            headers: new Headers({
                'Content-Type': 'text/plain',
            }),
        }).then(({ json }) => ({ data: json })),

    // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    deleteMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                    headers: new Headers({
                        'Content-Type': 'text/plain',
                    }),
                })
            )
        ).then(responses => ({
            data: responses.map(({ json }) => json.id),
        })),
});

export default dataProvider;
