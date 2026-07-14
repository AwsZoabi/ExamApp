import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['src', 'test', 'scripts'];
const files = [];

const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(path);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      files.push(path);
    }
  }
};

for (const root of roots) {
  await walk(resolve(root));
}

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax check passed for ${files.length} files.`);
