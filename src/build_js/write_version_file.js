
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs      = require('fs'),
      package = JSON.parse(`${fs.readFileSync('./package.json')}`);

const filename = './src/ts/generated_code/package_version.ts';

/* eslint-enable @typescript-eslint/no-var-requires */
/* eslint-enable no-undef */


const data_template = `
// Generated by %proj%/src/build_js/write_version_file.js

const version     = '${package.version}',
      built       = ${new Date().getTime()},
      packagename = '${package.name}';

export { version, packagename, built };
`;

fs.writeFileSync(filename, data_template, { flag: 'w', encoding: 'utf8'});

console.log(`# Wrote version file as ${package.name} ${package.version}; finished`); // eslint-disable-line no-undef
