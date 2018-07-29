import { version } from '../package.json'
import { boot } from './main'

/**
 * When required globally
 */
if (typeof (window) !== 'undefined') {
  console.log('[webcg-framework] version %s', version)
  boot(window)
}
