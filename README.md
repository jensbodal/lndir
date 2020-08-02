# lndir

Facilitates creating symlinks for directories within an npm package rather than having to symlink the package's root folder

## Problem

`yarn link` and `npm link` are not flexible and only allow symlinking the root folder for a package.  This results in a link to the
`node_modules` package within the library's folder, which may or may not contain dev only packages which are irrelevant to the runtime
of the library, and can cause dependency issues if those dev only dependencies are picked up instead of your package's dependencies. The
same is true and more likely for packages declared as `peerDependencies`.

## Solution

Install the package normally. Then symlink your locally installed version's runtime to the installed location's.

## Caveats

If you are adding new libraries in the library that you are trying to link, those libraries won't be present in the linked folder. You'll
want to install those locally to use them. You could also try installing the package using the `file://` syntax and then symlinking from there.

This might not work for packages that do not produce a single folder for which the runtime is to be executed from.  For example some packages
will publish folders to the root of their package's folder at publish time in order to present a clean folder structure and/or to allow
importing from submodules.

While you can simply use the root folder for the symlink, this will then symlink the `node_modules` folder in that locally installed package
as well.  If there are `peerDependencies` or `devDependencies` that conflict with your consumer package's modules, there could be issues.

Possibly in a future release this package can symlink all folders within a folder except for exclusions.

## Usage

### Link your locally installed version of a package

Assume we have a package with a published name (the name specified in its `package.json` file) of `@foo/bar`.

We want to make changes in this package and see them in another package which consumes this package.

```
ln dist

/**
 * package is now available at:
 * {
 *   "@foo/bar": {
 *     "absolutePath": "/some-path/bar/dist"
 *     "linkedPath": "dist"
 *   }
 * }
 */
```
### Use a locally linked version of a package

```
ln @foo/bar
```
