process.env.TZ = 'Etc/Universal'

/* Import modules */
    import Express from 'express'
    import objectPath from 'object-path'
/* Import modules */

/* Module */
    export enum ParameterTypes {
        string = 'string',
        number = 'number',
        boolean = 'boolean',
        object = 'object',
        array_string = 'array|string',
        array_number = 'array|number'
    }

    export interface Parameter {
        path: Array<string>,
        name: string,
        type: ParameterTypes,
        isRequired: boolean,
        maxLength?: number,
        minLength?: number
    }

    export function validateParameter(request: Express.Request, parameters: Array<Parameter>) {
        try {
            for(const parameter of parameters) {
                if(parameter.isRequired) {
                    let response = objectPath.get(request.body, parameter.path)
                    if(typeof response !== 'boolean' && !response) throw new Error('A required parameter is missing.')
                    switch(parameter.type) {
                        case ParameterTypes.string: try { response = String(response); break } catch(err) { break }
                        case ParameterTypes.number: try { response = Number(response); break } catch(err) { break }
                        case ParameterTypes.boolean: try { response = Boolean(response); break } catch(err) { break }
                        case ParameterTypes.object: try { response = Object(response); break } catch(err) { break }
                    }
                    if(parameter.type.indexOf('array') == -1) {
                        if(typeof response !== parameter.type) throw new Error('Invalid parameter type.')
                        if(parameter.maxLength) { if(response.length > parameter.maxLength) throw new Error('Exceeds maximum number of characters.') }
                        if(parameter.minLength) { if(response.length < parameter.minLength) throw new Error('Insufficient minimum number of characters.') }
                    } else {
                        if(Array.isArray(response) == false) throw new Error('Is not array.')
                        switch(parameter.type) {
                            case ParameterTypes.array_number:
                                for(const temporary of response) {
                                    if(typeof temporary !== 'number') throw new Error('Invalid parameter type.')
                                }
                                break
                            case ParameterTypes.array_string:
                                for(const temporary of response) {
                                    if(typeof temporary !== 'string') throw new Error('Invalid parameter type.')
                                }
                                break
                            default: throw new Error('Wrong parameter type.')
                        }
                    }
                }
            }
            return true
        } catch(err) {
            return false
        }
    }

    function getPathsByStack(handler: any): Array<{ path: string, method: Array<string> }> {
        const path: Array<{ path: string, method: Array<string> }> = new Array()
        if(handler == undefined) return path
        if(Array.isArray(handler)) {
            for(const stack of handler) {
                if(stack.route) {
                    if(typeof stack.route.path == 'string') path.push({ path: stack.route.path, method: Object.keys(stack.route.methods).filter(function (key) { return stack.route.methods[key] }) })
                } else {
                    if(stack.handle) {
                        if(Array.isArray(stack.handle.stack)) {
                            const response = getPathsByStack(stack.handle.stack)
                            let parent: string = ''
                            if(!stack.regexp.fast_slash) {
                                const domain = String(stack.regexp).split('/')
                                if(domain.length == 6) {
                                    parent = '/' + domain[2].replace('\\', '')
                                }
                            }
                            for(const temporary of response) {
                                if(typeof temporary.path == 'string') path.push({ path: parent + temporary.path, method: temporary.method })
                            }
                        }
                    }
                }
            }
        } else {
            if(handler.route) {
                if(typeof handler.route.path == 'string') path.push({ path: handler.route.path, method: Object.keys(handler.route.methods).filter(function (key) { return handler.route.methods[key] }) })
            } else {
                if(handler.handle) {
                    if(Array.isArray(handler.handle.stack)) {
                        const response = getPathsByStack(handler.handle.stack)
                        for(const temporary of response) {
                            if(typeof temporary == 'string') path.push(temporary)
                        }
                    }
                }
            }
        }
        return path
    } 

    export function getPathsByRouter(router: Express.Router): Array<{ path: string, method: Array<string> }> {
        return getPathsByStack(router.stack)
    }
/* Module */