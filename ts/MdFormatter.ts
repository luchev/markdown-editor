import {Formatter} from './Formatter';
import {DOMHelper} from './DOMHelper';
import {Compiler} from './Compiler';
import {ReferenceDictionary} from './Compiler';

interface Settings {
  dynamicRender: boolean;
  showSyntax: boolean;
}

interface DocumentData {
  currentParagraph: HTMLElement | null;
  references: ReferenceDictionary;
}

/**
 * Markdown formatter which is based on the generic Formatter class
 * This formatter uses common Markdown syntax to
 */
export class MdFormatter extends Formatter {
  // Hook to the editor html element
  private editor: HTMLElement = document.createElement('invalid');

  // Settings for the formatter/compiler
  private settings: Settings = {
    dynamicRender: true,
    showSyntax: true,
  }

  // Data specific to the currently open document
  private documentData: DocumentData = {
    currentParagraph: null,
    references: {},
  }

  private compiler: Compiler = new Compiler();

  /**
   * Initialize the mutation observer, which monitors changes happening
   * inside the container
   * @param {HTMLElement} editor HTML editable div used as editor
   */
  init(editor: HTMLElement): void {
    this.editor = editor;
    this.initMutationListeners();
    this.initKeyboardEventListeners();
    this.initMouseEventListeners();
  }

  /** Set the content of the current document
   * @param {string} content
   */
  setContent(content: string): void {
    const {html, references} = this.compiler.compileText(content, {});
    this.editor.innerHTML = '';
    for (const div of html) {
      this.editor.appendChild(div);
    }

    this.documentData.references = references;
  }

  /** Get the content of the current document as text
   * @return {string}
   */
  getContent(): string {
    // TODO
    const content = '';
    return content;
  }

  /**
   * Initialize global event listeners for changes in the DOM tree
   * or user input in the editor div
   */
  private initMutationListeners(): void {
    const observerConfig = {
      childList: true, // addition/removal of children in the dom tree
      subtree: true, // observe also grandchildren
      characterData: true, // observe keyboard input
      // attributes: true, // observe attribute change (maybe?)
    };

    const observer = new MutationObserver((mutations) =>
      this.handleMutations(mutations),
    );

    observer.observe(this.editor, observerConfig);
  }

  /** Initialize keyboard event listeners */
  private initKeyboardEventListeners(): void {
    this.editor.addEventListener('keyup', () => this.handleKeyUp());
  }

  /** Initialize keyboard event listeners */
  private initMouseEventListeners(): void {
    this.editor.addEventListener('click', () => this.handleClick());
  }

  /** Handle hotkeys
   * @param {KeyboardEvent} event
   */
  private handleKeyUp(): void {
    this.caretMoved();
  }

  /** Find the div in which the caret is
   * @return {HTMLElement | null} the div in which
   * the carret currently is or null if it's not in any
   */
  private getCaretDiv(): HTMLElement | null {
    let element = document.getSelection()?.anchorNode
      ?.parentElement as HTMLElement;

    if (element) {
      while (element.parentElement && element.parentElement !== this.editor) {
        element = element.parentElement;
      }
    }

    if (element.parentElement === this.editor) {
      return element;
    } else {
      return null;
    }
  }

  /** Handle caret entering a new div */
  private caretMoved(): void {
    const newCurrentParagraph = this.getCaretDiv();
    if (this.documentData.currentParagraph !== newCurrentParagraph) {
      if (this.documentData.currentParagraph) {
        this.documentData.currentParagraph.setAttribute('data-active', 'false');
        this.documentData.currentParagraph.setAttribute('data-text', this.documentData.currentParagraph.innerText);
        const compiled = this.compiler.compileParagraph(this.documentData.currentParagraph.innerText, this.documentData.references);
        if (compiled instanceof HTMLElement) {
          this.documentData.currentParagraph.innerHTML = '';
          this.documentData.currentParagraph.appendChild(compiled);
        } else {
          const reference = compiled;
          console.log(reference);
          this.documentData.references[reference.reference] = reference.data;
          this.compiler.fixReferences([this.editor], reference);
        }
      }

      this.documentData.currentParagraph = newCurrentParagraph;

      if (this.documentData.currentParagraph) {
        this.documentData.currentParagraph.setAttribute('data-active', 'true');
        const text = this.documentData.currentParagraph.getAttribute('data-text');
        if (text) {
          this.documentData.currentParagraph.innerText = text;
        }
      }
    }
  }

  /** Handle mouse click in the editor
   * @param {MouseEvent} event
   */
  private handleClick(): void {
    this.caretMoved();
  }

  /** Get list of property elements to put in the settings menu in the editor
   * @return {HTMLElement[]} List of settings as div elements
   */
  getSettings(): HTMLElement[] {
    const settingsHtml = [
      `
      <div data-setting="dynamic-render" style='display: flex;
      flex-direction: row; justify-items: center;
      justify-content: space-between; margin-top: 20px;'>
        <div style='display: flex;'>
          Dynamic render
        </div>
        <div style='display: flex;'>
          <svg display="none" width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path
            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>
      `,
      `
      <div data-setting="hide-syntax"
      style='display: flex; flex-direction: row; justify-items: center;
      justify-content: space-between; margin-top: 20px;'>
        <div style='display: flex;'>
          Hide syntax
        </div>
        <div style='display: flex;'>
          <svg display="none" width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path
            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>
      `,
    ];

    const settingsElements = settingsHtml.map((setting) =>
      DOMHelper.htmlElementFromString(setting),
    );

    // TODO convert the following foreach to event delegation
    settingsElements.forEach((element) => {
      if (element.hasAttribute('data-setting')) {
        if (element.getAttribute('data-setting') === 'dynamic-render') {
          element.addEventListener('click', (event: MouseEvent) =>
            this.toggleDynamicRender(event),
          );
        } else if (element.getAttribute('data-setting') === 'hide-syntax') {
          element.addEventListener('click', (event: MouseEvent) =>
            this.toggleHideSyntax(event),
          );
        }
      }
    });

    return settingsElements;
  }

  /** Method to handle the click event on the setting Toggle Dynamic Renderer
   * @param {MouseEvent} event Click event to toggle Dynamic Renderer
   */
  private toggleDynamicRender(event: MouseEvent): void {
    const settingsItem = event.currentTarget as Element;
    const svgs = settingsItem?.children[1].children;

    for (const svg of svgs) {
      if (svg.hasAttribute('display')) {
        svg.removeAttribute('display');
      } else {
        svg.setAttribute('display', 'none');
      }
    }

    this.settings.dynamicRender = !this.settings.dynamicRender;
    if (this.settings.dynamicRender) {
      this.enableRendering();
    } else {
      this.disableRendering();
    }
  }

  /** Method to handle the click event on the setting Toggle Dynamic Renderer
   * @param {MouseEvent} event Click event to toggle Dynamic Renderer
   */
  private toggleHideSyntax(event: MouseEvent): void {
    const settingsItem = event.currentTarget as Element;
    const svgs = settingsItem?.children[1].children;

    for (const svg of svgs) {
      if (svg.hasAttribute('display')) {
        svg.removeAttribute('display');
      } else {
        svg.setAttribute('display', 'none');
      }
    }

    this.settings.showSyntax = !this.settings.showSyntax;
    if (this.settings.showSyntax) {
      this.enableHideSyntax();
    } else {
      this.disableHideSyntax();
    }
  }

  /** Enable hiding syntax, aka MD identifiers like "# " and "** <some-text> **"
   */
  private enableHideSyntax(): void {
    this.settings.showSyntax = true;
  }

  /** Disable hiding syntax, aka MD identifiers like "# " and "** <some-text> **"
   */
  private disableHideSyntax(): void {
    this.settings.showSyntax = false;
  }

  /** Handle array of Mutations
   * @param {MutationRecord[]} mutations array of mutations
   */
  private handleMutations(mutations: MutationRecord[]): void {
    mutations.map((mutation) => {
      if (mutation.type === 'childList') {
        this.handleChildListMutation(mutation);
      } else if (mutation.type === 'characterData') {
        this.handleCharacterDataMutation(mutation);
      }
    });
  }

  /** Handle a single Mutation of type childList
   * @param {MutationRecord} mutation The mutation that happened
   */
  private handleChildListMutation(mutation: MutationRecord): void {
    if (mutation.addedNodes.length === 0) {
      return;
    }

    const addedNode: Node = mutation.addedNodes[0];
    // Add first div if the editor is empty and this is the first added #text
    // The first text written will not be in a separate div,
    // so create a div for it and put the text inside
    if (
      addedNode.nodeName === '#text' &&
      addedNode.parentElement === this.editor
    ) {
      const newDiv = document.createElement('div');
      this.editor.insertBefore(newDiv, addedNode.nextSibling);
      newDiv.appendChild(addedNode);

      // Move cursor to end of line
      const range: Range = document.createRange();
      const sel: Selection | null = window.getSelection();
      range.setStart(this.editor.childNodes[0], newDiv.innerText.length);
      range.collapse(true);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  /** Handle a single Mutation of type characterData
   * @param {MutationRecord} mutation The mutation that happened
   */
  private handleCharacterDataMutation(mutation: MutationRecord): void {
    const element = mutation.target.parentElement;
    // TODO
  }

  /** Disable and Remove all formatting */
  private disableRendering(): void {
    this.settings.dynamicRender = false;
  }

  /** Enable and apply all formatting */
  private enableRendering(): void {
    this.settings.dynamicRender = true;
  }
}
