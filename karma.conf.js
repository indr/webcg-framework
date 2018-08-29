module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'sinon-chai', 'phantomjs-shim'],
    reporters: ['spec', 'coverage'],
    files: [
      /**
       * Make sure to disable Karma’s file watcher
       * because the preprocessor will use its own.
       */
      { pattern: 'test/**/*.spec.js', watched: false }
    ],
    preprocessors: {
      'test/**/*.spec.js': ['rollup', 'sourcemap', 'coverage']
    },
    rollupPreprocessor: {
      /**
       * This is just a normal Rollup config object,
       * except that `input` is handled for you.
       */
      plugins: [require('rollup-plugin-buble')()],
      output: {
        format: 'iife', // Helps prevent naming collisions.
        name: 'webcgFramework', // Required for 'iife' format.
        sourcemap: 'inline' // Sensible for testing.
      }
    },
    coverageReporter: {
      dir: './test/coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
