
import fs from 'fs';

/**
 * Logger utility class for centralized logging with timestamps in file logs.
 */
class Logger {
  logsPath = './logs.txt';
  tag;

  constructor(tag) {
    this.tag = tag;
  }

  /**
   * Generates a timestamp in ISO format.
   * @returns {string} Timestamp string.
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  info(message, ...args) {
    fs.appendFileSync(
      this.logsPath,
      `[${this.getTimestamp()}] [INFO] [${this.tag}] ${message}\n`,
      'utf8'
    );
    console.info(`[INFO] [${this.tag}] ${message}`, ...args);
  }

  warn(message, ...args) {
    fs.appendFileSync(
      this.logsPath,
      `[${this.getTimestamp()}] [WARN] [${this.tag}] ${message}\n`,
      'utf8'
    );
    console.warn(`[WARN] [${this.tag}] ${message}`, ...args);
  }

  error(message, ...args) {
    fs.appendFileSync(
      this.logsPath,
      `[${this.getTimestamp()}] [ERROR] [${this.tag}] ${message}\n`,
      'utf8'
    );
    console.error(`[ERROR] [${this.tag}] ${message}`, ...args);
  }

  debug(message, ...args) {
    fs.appendFileSync(
      this.logsPath,
      `[${this.getTimestamp()}] [DEBUG] [${this.tag}] ${message}\n`,
      'utf8'
    );
    console.debug(`[DEBUG] [${this.tag}] ${message}`, ...args);
  }

  log(message, ...args) {
    fs.appendFileSync(
      this.logsPath,
      `[${this.getTimestamp()}] [LOG] [${this.tag}] ${message}\n`,
      'utf8'
    );
    console.log(`[LOG] [${this.tag}] ${message}`, ...args);
  }
}

export default Logger;

