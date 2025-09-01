import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { readFileSync } from 'fs';
import * as typescriptModule from 'typescript';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const isDev = process.env.NODE_ENV === 'development';

const findAvailablePort = () => {
  const startPort = 3000;
  const endPort = 3999;
  return { port: startPort, portRange: [startPort, endPort] };
};

const { port, portRange } = findAvailablePort();

const config = {
  input: isDev ? 'src/dev.tsx' : 'src/index.ts',
  output: isDev ? {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    sourcemapExcludeSources: false,
  } : [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    }
  ],
  external: isDev ? [] : [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  inlineDynamicImports: true,
  plugins: [
    json(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        'process.env': JSON.stringify({}),
      }
    }),
    typescript({
      typescript: typescriptModule,
      useTsconfigDeclarationDir: true,
      sourceMap: true,
      inlineSources: true,
    }),
    postcss({
      extract: isDev ? false : 'dist/styles.css',
      minimize: !isDev,
      modules: false,
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({
      include: /node_modules/,
    }),
  ],
};

if (isDev) {
  config.plugins.push(
    serve({
      contentBase: ['dist', 'public'],
      port,
      portRange,
      open: true,
      host: 'localhost',
    }),
    livereload('dist')
  );
}

export default config;