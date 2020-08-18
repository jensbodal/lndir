#!/usr/bin/env node
const os = require('os');
const { existsSync, mkdirSync, renameSync, symlinkSync, writeFileSync }  = require('fs')
const { resolve } = require('path');

const readJson = filePath => JSON.parse(require(filePath));
const writeJson = (filePath, json) => writeFileSync(filePath, JSON.stringify(json, null, 2));

(async(argv, currentPath) => {
  const [ nodePath, scriptPath, ...args ] = argv;
  const homeDir = os.homedir();
  const configDir = `${homeDir}/.config/npm/lndir`;
  const linksFilepath = `${configDir}/links.json`;

  let linkThis;

  // create config if it doesn't exist
  if (!existsSync(linksFilepath)) {
    mkdirSync(configDir, { recursive: true });
    writeJson(linksFilepath, {});
    console.log(`lndir map file created at: [${linksFilepath}]`);
  };

  console.log(`Links mapping file is located at [${linksFilepath}]`);
  const mappings = require(linksFilepath);

  if (args.length > 1) {
    console.error('Either pass in the name of an existing link or the directory of one to create');
    console.log(mappings);
  }

  if (args.length === 1) {
    linkThis = args[0];
  }

  // No argument given, print mappings
  if (!linkThis) {
    console.log('You must pass a directory to this command to link or specify an existing mapping');
    console.log(mappings);
    return;
  }

  // check if we are given the name of a package to link and then try to link it
  if (mappings[linkThis]) {
    const mapping = mappings[linkThis];
    const expectedLocalPackageDir = `${currentPath}/node_modules/${linkThis}`;

    if (!existsSync(expectedLocalPackageDir)) {
      console.error('You must install the package normally before replacing it with a linked version');
      return;
    }

    const linkPathAt = `${expectedLocalPackageDir}/${mapping.linkedPath}`;
    const backupPath = `${linkPathAt}.bak`;

    console.log(`Linking:\n\t"${mapping.absolutePath}"\n\tto\n\t"${linkPathAt}"\n`);

    if (existsSync(backupPath)) {
      console.error(`Backup exists at:\n\t"${backupPath}"\n`);
      console.error('Either restore this directory or remove it to continue');
      return;
    }

    if (!existsSync(linkPathAt)) {
      console.error(`Target path to replace with symlink does not exist [${linkPathAt}]`);
      return;
    }

    if (existsSync(linkPathAt)) {
      console.log(`Backing up [${linkPathAt}] to [${backupPath}]`);
      renameSync(linkPathAt, backupPath);
    }

    symlinkSync(mapping.absolutePath, linkPathAt, 'dir');

    return;
  }

  // assume we are trying to symlink a directory
  if (linkThis) {
    if (!existsSync(linkThis)) {
      console.error(`Directory does not exist: ${linkThis}`);
      return;
    }

    if (!existsSync(`${currentPath}/package.json`)) {
      console.error('Script must be executed in the same directory that your package.json file exists at')
      return;
    }

    const packageJson = require(`${currentPath}/package.json`);
    console.log(__dirname);

    if (!typeof packageJson === 'object' || !packageJson.name) {
      console.error('package.json file must contain a name property');
      return;
    }

    const linkName = packageJson.name;
    const pathToLink = resolve(linkThis);

    if (mappings[linkName]) {
      console.log(`Mapping already exists for ${linkName} at ${mappings[linkName].absolutePath}`);
      console.log('Previous mapping will be removed');
    }

    console.log(`Creating link for ${linkName} at ${pathToLink}`)

    mappings[linkName] = {};
    mappings[linkName].absolutePath = pathToLink;
    mappings[linkName].linkedPath = linkThis;

    writeJson(linksFilepath, mappings);

    console.log(mappings);

    return;
  }
})(process.argv, process.cwd());
