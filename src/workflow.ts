import { IStep, Step, IHook, HookType } from './types';

class Workflow {
    steps: Map<number, IStep> = new Map();

    static NewWorkflow() {
        return new Workflow();
    }
    public addStep<Input, Output>(step: Step, ...hooks: IHook[]) {
        this.steps.set(this.steps.size + 1, {
            step,
            hooks: hooks
        })
        return this;
    }

    public addSteps(...args: [Step, ...IHook[]][]) {
        args.forEach(arg => {
            this.addStep(...arg);
        })
        return this;
    }

    private createWrappedAsyncStep({ step, hooks }: IStep, comingInput: any) {
        const befores = hooks.filter(hook => hook.type === HookType.before);
        const afters = hooks.filter(hook => hook.type === HookType.after)
        async function wrappedStep (input: any) {
            let nextInput = input;
            for await (let before of befores) {
                if (before.options?.readFromOriginalInput) {
                    nextInput = input;
                }
                const beforeResult = before.func.constructor.name === "AsyncFunction" ? await before.func(nextInput) : before.func(nextInput);
                nextInput = beforeResult ? beforeResult : before.options?.defaultReturningInput ? nextInput : beforeResult;
            }
            const stepResult = step.func.constructor.name === "AsyncFunction" ? await step.func(nextInput) : step.func(nextInput);
            nextInput =  stepResult ? stepResult : step.options?.defaultReturningInput ? nextInput : stepResult;
            for (let after of afters) {
                if (after.options?.readFromOriginalInput) {
                    nextInput = input;
                } else {
                    nextInput = stepResult;
                }
                setImmediate(() => {
                    after.func(nextInput);
                });
            }
            return stepResult;
        }
        return wrappedStep(comingInput)
    }

    public composeAsync<Input, Output = any>() {
        return async (input?: Input): Promise<Output> => {
            const iterator = this.steps.entries();
            let returnedResult: Output;
            let nextInput: any = input;
            for await (let [, value] of iterator) {
                if (value.step.options?.readFromOriginalInput) {
                    nextInput = input;
                }
                nextInput = await this.createWrappedAsyncStep(value, nextInput);
                returnedResult = nextInput;
            }
            return returnedResult
        }
    }
}

export default Workflow;
export * from './types';