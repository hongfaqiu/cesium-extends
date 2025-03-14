import { builtinModules } from 'module';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import styles from 'rollup-plugin-styles';
import { defineConfig } from 'rollup';
import pkg from './package.json' with { type: 'json' };

const external = [
  ...builtinModules,
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  esbuild({
    target: 'node14',
  }),
  styles({
    minimize: true,
    extensions: ['.scss'],
  }),
];

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].js',
      chunkFileNames: 'chunk-[name].js',
    },
    external,
    plugins,
    onwarn,
  },
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      entryFileNames: '[name].d.ts',
      format: 'esm',
    },
    external: [...external, /\.scss$/u],
    plugins: [dts({ respectExternal: true })],
    onwarn,
  },
]);

function onwarn(message) {
  if (['EMPTY_BUNDLE', 'CIRCULAR_DEPENDENCY'].includes(message.code)) return;
  console.error(message);
}
