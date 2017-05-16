const O = Object

/*  ------------------------------------------------------------------------ */

const merge = (to, from) => {

    for (const prop in from) { O.defineProperty (to, prop, O.getOwnPropertyDescriptor (from, prop)) }

    return to
}

/*  ------------------------------------------------------------------------ */

const pipez = module.exports = functions => O.assign (

/*  Function of functions (call chain)  */

    (...initial) =>
        Reflect.ownKeys (functions) // guaranteed to be in property creation order (as defined by the standard)
               .reduce ((memo, k) => functions[k] (memo, {}), initial),

/*  Additional methods     */

    {
        configure (overrides = {}) {

            const modifiedFunctions = {}

            for (const k of Reflect.ownKeys (functions)) {

                const override = overrides[k],
                      before   = overrides['+' + k] || (x => x),
                      after    = overrides[k + '+'] || (x => x),
                      fn       = (typeof override === 'function') ? override : functions[k]

                const boundArgs = (typeof override === 'boolean') ? { yes: override } : (override || {})

                modifiedFunctions[k] = (x, args) => {

                    const newArgs = O.assign ({}, boundArgs, args),
                          maybeFn = (newArgs.yes === false) ? (x => x) : fn

                    return after (maybeFn (before (x, newArgs), newArgs), newArgs)
                }
            }

            return pipez (modifiedFunctions).methods (this.methods_)
        },

        methods_: {},

        methods (methods) { return merge (this, merge (this.methods_, methods)) },

        get impl () { return functions }
    }
)

/*  ------------------------------------------------------------------------ */
