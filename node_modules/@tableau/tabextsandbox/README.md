# Tableau Extensions Sandbox

Sandboxed Extensions are a type of Tableau Extension that are not permitted to make external network requests and thus cannot exfiltrate end-user data. A Sandboxed Extension is hosted by Tableau and, using W3C standards, is wrapped inside an environment which prevents communication to anything except the Tableau hosting server. For further details, see [Tableau Extensions API](https://github.com/tableau/extensions-api).

This project contains a local development environment that replicates the Tableau Sandboxed Extension Hosting Cloud Service so developers can test their extensions with the same sandbox policies before deployment.

This package is not for deploying to production. When your Extension is ready to deploy to production, see [Publish Sandboxed Extensions](https://tableau.github.io/extensions-api/docs/trex_sandbox_publish.html).

## Installation

This package can be installed both locally, within a nodejs project, or globally and executed anywhere.

```
npm install [-g] @tableau/tabextsandbox
```

## Setup

When `tabextsandbox` starts, it serves sandboxed extension web pages on the HTTP port specified.

To run `tabextsandbox`, you specify a server configuration file (config.json) that identifies the extensions that the sandbox server will host.

The following is an example `config.json` that specifies running on HTTP port 8080 with 2 extensions.

```
{
    "port": 8080,
    "extensions": {
        "myExtension": {
            "path": "path/to/extension"
        },
        "anotherExtension": {
            "path": "c:/extensions/extension2"
        }
    }
}
```

`myExtension` will be served at `http://localhost:8080/sandbox/myExtension/` from `path/to/extension`, which will be resolved as a path relative to the location of `config.json`.

`anotherExtension` will be served at `http://localhost:8080/sandbox/anotherExtension/` from `c:\extensions\extension2`.

## Running

If installed globally, run `tabextsandbox` and specify the required path to config.json. Note that relative extension paths will be relative to the location of config.json.

```
E:\extensions>tabextsandbox
Usage: tabextsandbox --config [config.json]

    Options:
      --config                         Server configuration file          [required]
      -h, --help                       Show help
```

If installed locally, use `npx tabextsandbox [arguments]`.

## Usage

Create a Tableau Extension Manifest (`.trex`) that points to your local environment to test extensions in Tableau.

Note that you need to specify the full URL to the extension in the `.trex` file. The sandbox server (`tabextsandox`) requires an explicit path and file name.

# Deployment

`tabextsandbox` is designed for local development use only. It is not for deploying to production. When your Extension is ready to deploy to production, see [Publish Sandboxed Extensions](https://tableau.github.io/extensions-api/docs/trex_sandbox_publish.html).

# Support

For more information about creating and testing Sandboxed extensions, see the developer documentation [Tableau Extensions API](https://tableau.github.io/extensions-api/).
