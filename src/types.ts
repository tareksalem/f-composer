export enum HookType {
    before = "before",
    after = "after",
    workflowError = "workflowError",
    stepError = "stepError"
}

export type StepFuncType<Input = any, Output = any> = (input: Input) => Output

export interface IHookOption {
    readFromOriginalInput?: boolean
    defaultReturningInput?: boolean
}

export interface IHook {
    type: HookType,
    func: StepFuncType
    options?: IHookOption
}

export interface Step {
    func: StepFuncType
    options?: IHookOption
}

export interface IStep<StepInput = any, StepOutput = any> {
    step: Step
    hooks: IHook[]
}