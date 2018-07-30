import babelPlugin from 'rollup-plugin-babel';
import cjsPlugin from 'rollup-plugin-commonjs';

const commonPluginsConfig = [
  cjsPlugin(),
  babelPlugin({
    // runtimeHelpers: true,
    exclude: 'node_modules/**',
  })
];

export default [
  {
    input: 'src/fetch-request.js',
    output: {
      name: 'FetchRequest',
      file: 'lib/fetch-request.js',
      format: 'cjs',
    },
    plugins: commonPluginsConfig,
    external: [ 'isomorphic-fetch', 'qs' ],
  },
];
