# F-Composer


A nodejs library for composing tiny functions together in a sequential manner

## Installation

```cmd
npm i f-composer
```

## Introduction

This library has a backbone component which is `Workflow`, basically the workflow is a collection of tiny functions are combined together to form a bigger implementation, these tiny functions are called steps, these steps are exeucted in a sequential manner, you can also inject some hooks for each steps to be exeucted before or after the step execution

This library borrows some concepts from functional programming, one of these concepts, each step added to this workflow should have input or output, and each output of the function will be the input for the next one.

## Use Case
- **FP Implementation**: In javascript world you have the ability to write your code in different paradigms, and different ways, one of these paradigms is expressing your code in functions, could be anonymous functions, named functions or arrow functions, using this library you can expose your busines in very small functions and compose them together in workflow to build something bigger that can execute these tiny functions in a sequential manner
- **Decorators**: If you are familiar with OOP world you will be familiar with decorators pattern to attach additional behaviors to your code without affecting the code base, using this library you can do something similar to this pattern, by attaching hooks to the workflow steps you can inject additional behaviors to be executed before or after each step in your workflow
- **Dependency Injection**: The hooks concept in this library could be used to inject things into your functions without affecting these functions or reading things from the global scope
- **Middlewares**: In http routing world, there is a common concept is called middleware which allows you to execute some behaviors without affecting the main context, the problem is, this concept is only used on http layer or router later or controller layer, but doesn't exist on service layer, this library tries to bring this concept to to the down layer, which is the service layer, so instead of putting your logic inside a single function or inside a single service, you can start divide the service implementation into smaller functions that could be executed in a sequential manner

## Usage

This library could be used in typescript or javascript, also can run either on nodejs server or on browser

```typescript
const workflow = Workflow.NewWorkflow();
```

`NewWorkflow` method is used to create new workflow object

Then you can add steps as much as you want, you can add one step using the following method

```typescript
workflow.addStep(func, before, after);
```

this method takes three arguments, the first argument, is the step you want to add to this workflow and takes two optional arguments as the followin:

- before: this is a function that will be executed before the actual step function, this one also could be used to change the input for the step function
- after: this is a function that will be executed after the actual step is executed

**Note**
each step function can return an output, this output will be used to feed the next function input


#### Adding multiple steps in one call

you can add multiple steps in one call using the following method:

```typescript
workflow.addSteps([func, before, after], [func, before, after]);
```

this method takes endless arguments, each argument should be an array with three arguments, the first argument is the function that you want to execute inside the step, and the other two arguments are optional, one is before function that will be executed before the step function and the second one is after function that will be executed after the step function

**Note**
the functions are executed sequentially and in FIFO mode, which means the first function registered to this workflow it will be the first one

### Building the workflow
After adding steps to the workflow now you need to compose/build the workflow you created, by combining the steps in a series, this is done using a function called `composeAsync`, if you are working with typescript, this function takes a generic type which is the returned type from this workflow

```typescript
workflow.composeAsync<string>();
```

## Examples

### Logger Example

This example shows you how to attach a logger before executing the workflow steps and after executing them

```typescript
const workflow = Workflow.NewWorkflow();

const startLoggerStep = (...args: any) => {
    console.log('started executing workflow', args);
    return args;
};

const endLoggerStep = (result: number) => {
    console.log('ending executing workflow', result);
    return result;
};

const add1Step = (num: number): number => {
    return num + 1;
}

const adder1Service = workflow.addStep(startLoggerStep).addStep(add1Step).addStep(endLoggerStep).composeAsync<number>();

(async () => {
    const result = await adder1Service(1)
    console.log(result);
})()

```
