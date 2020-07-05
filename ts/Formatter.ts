/**
 * ! This is a base class, which must be extended for every different formatter
 * Base class for formatter logic used in the editor
 * To customize the formatting rules inherit this clas and
 * override the init method
 */
export abstract class Formatter {
  /**
   * This method should initialize all the event handles and methods
   * which are responsible for formatting the content of the container
   * @param {HTMLElement} container HTML editable div used as editor
   */
  abstract init(container: HTMLElement): void;

  abstract getSettings(): HTMLElement[];

  abstract getContent(): string;

  abstract setContent(content: string): void;
}
