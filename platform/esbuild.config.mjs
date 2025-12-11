import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

build({
  entryPoints: ['server/index.ts'],
  platform: 'node',
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  plugins: [
    {
      name: 'path-alias',
      setup(build) {
        // Resolve @shared/* to shared/*
        build.onResolve({ filter: /^@shared\// }, (args) => {
          const resolvedPath = args.path.replace('@shared/', 'shared/');
          let fullPath = path.resolve(__dirname, resolvedPath);
          // If no extension, try .ts first, then check if file exists
          if (!path.extname(fullPath)) {
            const tsPath = fullPath + '.ts';
            // esbuild will handle the file resolution, so we can just return the .ts path
            fullPath = tsPath;
          }
          return {
            path: fullPath,
          };
        });
        // Resolve @shared to shared/index.ts
        build.onResolve({ filter: /^@shared$/ }, (args) => {
          return {
            path: path.resolve(__dirname, 'shared', 'index.ts'),
          };
        });
        // Resolve @/* to client/src/*
        build.onResolve({ filter: /^@\// }, (args) => {
          return {
            path: path.resolve(__dirname, args.path.replace('@/', 'client/src/')),
          };
        });
      },
    },
  ],
}).catch(() => process.exit(1));

