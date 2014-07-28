Who? Why? When?
---------------

I made this tool when I just got a project from my coworker, and after running `npm install` then `grunt build` failed miserably. It was working well on his machine, so we compared `npm ls` and after a few manual `npm install` I finally discovered that a very specific version of a module was required to make the `grunt build` work.

This situation **should never happen**. In a ideal world where developers all follow `semver` and don't let their projects in version `0.x` for its whole life, then it would not happen. But we don't live in this world :(

What?
-----

Work in progress. Tool is working, but it needs some polish and documentation :)

It, above all, needs optimization in the process too.

### Roadmap

* [x] Working API
* [x] Working CLI
* [ ] Better output
* [ ] Better performance (parallel downloads and/or installs and/or tests)
* [ ] Tool to generate `npm-dichotomy.json` (some smart guesses from `package.json`)
* [ ] Conquer the world

How?
----

### Installation

```
npm install -g npm-dichotomy
```

### Configure & run

Create a `npm-dichotomy.json` file:

```json
{
  "test": "grunt build",
  "setup": "npm install",
  "modules": {
    "grunt": {"gte": "0.4.2", "satisfies": "~0.4.1"},
    "grunt-angular-templates": {"gte": "0.4.8", "satisfies": "~0.4.7"}
  }
}
```

* `test` is the command run after each `npm install`, this command must exit with code `0` to mark a success
* `setup` is the command run once at beginning of the global operation
* `debug` is a boolean, set to true if you want debug (dev) information
* `modules` defines the criteria to follow, as a set of `semver` rules.
  * Key is the module's name
  * A rule is a method of `semver` module, you will generally need `lte`, `lt`, `gte`, `gt` and `satisfies` which are all self-explanatory
  * Typically you know that your test worked once in your project's life, you have an idea of the few modules that may cause the bug, you may simply list them and add a single `satisfies` rule copied from your `package.json`
  * Additionnally, you may know a module's version when it was working, you can then add a `gte` rule to limit the number of tested versions

Then run

```sh
npm-dichotomy
```

### How it works

`npm-dichotomy` will then grab available versions for each module, keep only the matching ones, then calculate all the possible combinations and **test them all**, one by one. That can be long, time for a cup of tea.

You can follow the progress in standard output, but that's not really the point of this command, it's supposed to free your mind from this annoying task. At the very end `npm-dichotomy` will display the successful combinations.

### Final result

```js
[ { versions: [ 'grunt@0.4.2', 'grunt-angular-templates@0.4.9' ],
    success: true } ]
```

### What then?

Now you know, you can make your `package.json` more strict, yell on modules' maintainers, or try to understand why it failed, with a lot more information.
