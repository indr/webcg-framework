# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.1.1"></a>
## [2.1.1](https://github.com/indr/webcg-framework/compare/v2.1.0...v2.1.1) (2018-09-21)


### Bug Fixes

* update webcg-devtools to 1.2.0 ([cb16dd0](https://github.com/indr/webcg-framework/commit/cb16dd0))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/indr/webcg-framework/compare/v2.0.0...v2.1.0) (2018-09-20)


### Features

* add listeners for custom invokable functions ([baf6632](https://github.com/indr/webcg-framework/commit/baf6632))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/indr/webcg-framework/compare/v1.2.2...v2.0.0) (2018-09-20)


### Features

* listeners are called with data arguments instead of custom event ([42a32e4](https://github.com/indr/webcg-framework/commit/42a32e4))
* return false instead of event.preventDefault() ([74bd918](https://github.com/indr/webcg-framework/commit/74bd918))


### BREAKING CHANGES

* the first argument of the event listener is replaced with the events detail property. This simplifies event handling and allow the event handlers to have the same signature as called by CasparCG's HTML producer.
* instead of calling event.preventDefault() your event handler has to return false



<a name="1.2.2"></a>
## [1.2.2](https://github.com/indr/webcg-framework/compare/v1.2.1...v1.2.2) (2018-08-29)


### Bug Fixes

* update example-lower-third ([ae978b0](https://github.com/indr/webcg-framework/commit/ae978b0))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/indr/webcg-framework/compare/v1.2.0...v1.2.1) (2018-08-07)


### Bug Fixes

* loading webcg-devtools from same path when webcg-framework is rebundled ([f5af0bf](https://github.com/indr/webcg-framework/commit/f5af0bf))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/indr/webcg-framework/compare/v1.1.0...v1.2.0) (2018-08-07)


### Features

* load webcg-devtools from same path ([6ce4675](https://github.com/indr/webcg-framework/commit/6ce4675))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/indr/webcg-framework/compare/v1.0.0...v1.1.0) (2018-07-29)


### Features

* trigger event listeners in reverse order ([d34deb8](https://github.com/indr/webcg-framework/commit/d34deb8))



<a name="1.0.0"></a>
# 1.0.0 (2018-07-29)

### Features

* first release
