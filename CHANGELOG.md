# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.6.0](https://github.com/indr/webcg-framework/compare/v2.5.0...v2.6.0) (2020-02-12)


### Features

* add support for asynchronous command handling ([b47e2da](https://github.com/indr/webcg-framework/commit/b47e2da465b1d7438b4d292e6a395ab013c41245))


### Bug Fixes

* update webcg-devtools@2.0.0 ([d4699b1](https://github.com/indr/webcg-framework/commit/d4699b1631ef0b4a007cf155940b7151d6a1981a))

## [2.5.0](https://github.com/indr/webcg-framework/compare/v2.4.0...v2.5.0) (2020-01-22)


### Features

* add once() to register an event handler that is automatically removed after the first call ([7bee75d](https://github.com/indr/webcg-framework/commit/7bee75dc54f70182298ba6cdeeb355170919c8da))


### Bug Fixes

* remove once event handler in case it throws an error ([94af4fd](https://github.com/indr/webcg-framework/commit/94af4fd5a2c17484e98774b31126d34502581c0c))

<a name="2.4.0"></a>
# [2.4.0](https://github.com/indr/webcg-framework/compare/v2.3.0...v2.4.0) (2019-01-28)


### Features

* catch and log errors thrown by event listeners ([ff8bb02](https://github.com/indr/webcg-framework/commit/ff8bb02))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/indr/webcg-framework/compare/v2.2.1...v2.3.0) (2019-01-25)


### Bug Fixes

* remove substitution strings from console.log ([6b8143b](https://github.com/indr/webcg-framework/commit/6b8143b))


### Features

* add command buffering ([48b4f01](https://github.com/indr/webcg-framework/commit/48b4f01))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/indr/webcg-framework/compare/v2.2.0...v2.2.1) (2018-12-14)


### Bug Fixes

* update webcg-devtools@1.3.1 ([eb833ce](https://github.com/indr/webcg-framework/commit/eb833ce))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/indr/webcg-framework/compare/v2.1.1...v2.2.0) (2018-12-14)


### Features

* add window.debugData ([c327703](https://github.com/indr/webcg-framework/commit/c327703))
* prevent play or stop being called consecutively ([35d346d](https://github.com/indr/webcg-framework/commit/35d346d))



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
