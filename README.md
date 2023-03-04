# Sequential Workflow Model

[![License: MIT](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](/LICENSE) [![View this project on NPM](https://img.shields.io/npm/v/sequential-workflow-model.svg?style=flat-square)](https://npmjs.org/package/sequential-workflow-model)

This package contains a extendable data model of a sequential workflow.

The package is used by the following packages:
* [Sequential Workflow Designer](https://github.com/nocode-js/sequential-workflow-designer)
* [Sequential Workflow Machine](https://github.com/nocode-js/sequential-workflow-machine)

## 🔨 How to Extend Model

To extend the model, you need to extend base interfaces.

```ts
interface MyDefinition extends Definition {
  properties: {
    baseUrl: string;
  };
}

interface SendEmailStep extends Step {
  componentType: 'task';
  type: 'sendEmail';
  properties: {
    to: string;
    subject: string;
    body: string;
  };
}

interface IfStep extends BranchedStep {
  componentType: 'switch';
  type: 'if';
  properties: {
    condition: string;
  };
}
```

## 💡 License

This project is released under the MIT license.
