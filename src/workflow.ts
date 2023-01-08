type funcType = (...args: any) => any;

class Workflow {
    steps: Map<number, { func:<T> (...args: any) => T, hooks?: { before?:<T> (...args: any) => T, after?: <T> (...args: any) => T }}> = new Map();

    static NewWorkflow() {
        return new Workflow();
    }

    public addStep<T>(step: (...args: any) => T | void, before?: (...args: any) => any, after?: (...ags: any) => any) {
        this.steps.set(this.steps.size + 1, { func:<any> step, hooks: { before, after } });
        return this;
    }
    
    public addSteps(...args: [funcType, funcType?, funcType?][]) {
        args.forEach(step => {
            this.addStep(step[0], step[1], step[2]);
        });
        return this;
    }

    private createWrappedAsyncFunction(func: funcType, before: funcType | null, after: funcType | null, ...args: any) {
        const wrappedFunc = async (...childArgs: any) => {
            let beforeResult: any;
            if (typeof before === 'function') {
                 beforeResult = before.constructor.name === 'AsyncFunction' ? await before(...childArgs) : before(...childArgs);
            }
            const result: any = func.constructor.name === 'AsyncFunction' ? await func(...(beforeResult ? [beforeResult]: childArgs)) : func(...(beforeResult ? [beforeResult] : childArgs));
            if (typeof after === 'function') {
                after.constructor.name === 'AsyncFunction' ? await after(...(result ? [result]: childArgs)) : after(...(result ? [result]: childArgs));
            }
            return result;
        };
        return wrappedFunc(...args)
    }

    composeAsync<T>() {
        return async (...args: any) : Promise<T> => {
            const iterator = this.steps.entries();
            let returnedResult: any;
            let nextArguments: any;
            for await (let [key, value] of iterator) {
                const before = value.hooks?.before;
                const after = value.hooks?.after;
                const func = value.func;
                if (key === 1) {    console.log('executed first', args);
                    nextArguments = await this.createWrappedAsyncFunction(func, before, after, ...args);
                } else {
                    returnedResult = await this.createWrappedAsyncFunction(func, before, after, ...(nextArguments  ? [nextArguments] : args));
                    nextArguments = returnedResult;
                }
            }
            return returnedResult;
        }
    }
}

export default Workflow;