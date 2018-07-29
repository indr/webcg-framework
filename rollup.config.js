import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import pkg from './package.json'
import resolve from 'rollup-plugin-node-resolve'

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'webcg-framework',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve({
        browser: true,
        main: true
      }),
      commonjs(),
      json(),
      buble()
    ]
  }
]
