/**
 * Frontend Performance Utilities: Throttling, Debouncing, Currying & Safe Async
 */

/**
 * Throttle function execution to at most once per `limit` ms.
 * Ideal for high-frequency events like scroll, resize, mousemove.
 */
export const throttle = (func, limit = 100) => {
    let inThrottle = false;
    let lastFunc;
    let lastRan;

    return function (...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            lastRan = Date.now();
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastFunc) {
                    lastFunc();
                    lastFunc = null;
                }
            }, limit);
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if (Date.now() - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, Math.max(limit - (Date.now() - lastRan), 0));
        }
    };
};

/**
 * Debounce function execution until `wait` ms have passed since the last call.
 * Ideal for search input typing, window resize stabilization, form autosave.
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    const debounced = function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };

    debounced.cancel = () => {
        clearTimeout(timeout);
    };

    return debounced;
};

/**
 * Functional Currying Utility
 * Allows functions to be partially applied one argument at a time.
 * E.g., const handleField = curry((field, value) => setForm(f => ({ ...f, [field]: value })))
 */
export const curry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function (...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
};

/**
 * Curried event handler builder for input fields
 */
export const createFieldSetter = curry((setter, field, valueOrEvent) => {
    const val = valueOrEvent && valueOrEvent.target ? valueOrEvent.target.value : valueOrEvent;
    setter((prev) => ({ ...prev, [field]: val }));
});

/**
 * Curried filter matcher
 */
export const createFilter = curry((predicate, list) => {
    return Array.isArray(list) ? list.filter(predicate) : [];
});

/**
 * Safe Async Execution
 * Resolves to [data, null] or [null, error] to avoid try/catch boilerplate.
 */
export const safeAsync = async (promise) => {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        return [null, error];
    }
};
