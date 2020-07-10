import {Formatter} from './Formatter';
import {htmlElementFromString} from './HtmlGeneration';
import {Compiler} from './Compiler';
import {ReferenceDictionary} from './Compiler';
import {CssInjector} from './CssInjector';
import * as Prism from 'prismjs';

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
    showSyntax: false,
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

    CssInjector.injectCss('.md-token', {
      display: 'none',
    });
  }

  /** Set the content of the current document
   * @param {string} content
   */
  setContent(content: string): void {
    const {html, references} = this.compiler.compileText(content, {});
    this.editor.innerHTML = '';
    for (const element of html) {
      this.editor.appendChild(element);
    }

    this.documentData.references = references;
  }

  /** Get the content of the current document as text
   * @return {string}
   */
  getContent(): string {
    let content = '';
    for (const paragraph of this.editor.childNodes) {
      const element = paragraph as HTMLElement;
      if (element.hasAttribute('data-text')) {
        content += element.getAttribute('data-text');
      } else {
        content += element.innerText;
      }
      content += '\n\n';
    }
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
    // this.editor.addEventListener('keydown', () => this.handleKeyDown(event));
    this.editor.addEventListener('keyup', () => this.handleKeyUp());
  }

  /** Initialize mouse event listeners */
  private initMouseEventListeners(): void {
    this.editor.addEventListener('click', () => this.handleClick());
  }

  // /** Handle hotkeys
  //  * @param {KeyboardEvent | undefined} event
  //  */
  // private handleKeyDown(event: Event | undefined): void {
  //   // TODO
  // }

  /** Handle hotkeys
   * @param {KeyboardEvent | undefined} event
   */
  private handleKeyUp(): void {
  // private handleKeyUp(event: Event | undefined): void {
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

  /** Compile the text in the current paragraph to html and display the html instead of the text
   */
  private compileCurrentParagraph(): void {
    if (this.documentData.currentParagraph) {
      this.documentData.currentParagraph.setAttribute('data-text', this.documentData.currentParagraph.innerText);
      const compiled = this.compiler.compileParagraph(this.documentData.currentParagraph.innerText, this.documentData.references);
      this.documentData.currentParagraph.parentElement?.replaceChild(compiled.html, this.documentData.currentParagraph);
      this.documentData.currentParagraph = compiled.html;
      Prism.highlightAll();
      if (compiled.reference) {
        this.documentData.references[compiled.reference.name] = compiled.reference.data;
        this.compiler.fixReferences([this.editor], compiled.reference);
      }
      if (compiled.html.tagName === 'TABLE') {
        this.compiler.fixTable(compiled.html, compiled.html.previousSibling, compiled.html.nextSibling);
      }
    }
  }

  /** Strip the html from the current paragraph and display only the raw text
   * and move the carret to the appropriate position
   * @param {number} caretPosition the index where to move the carret
   */
  private decompileCurrentParagraph(caretPosition: number): void {
    if (this.documentData.currentParagraph) {
      const text = this.documentData.currentParagraph.getAttribute('data-text');
      this.documentData.currentParagraph.removeAttribute('data-text');
      if (text) {
        this.documentData.currentParagraph.innerText = text;
      }
      this.setCaretCharacterOffsetWithin(this.documentData.currentParagraph, caretPosition);
    }
  }

  /** Handle caret entering a new paragraph */
  private caretMoved(): void {
    const newCurrentParagraph = this.getCaretDiv();
    if (this.documentData.currentParagraph !== newCurrentParagraph) {
      let caretPosition = 0;
      if (newCurrentParagraph) {
        caretPosition = this.getCaretCharacterOffsetWithin(newCurrentParagraph);
      }

      if (this.settings.dynamicRender) {
        this.compileCurrentParagraph();
        this.documentData.currentParagraph = newCurrentParagraph;
        this.decompileCurrentParagraph(caretPosition);
      } else {
        this.documentData.currentParagraph = newCurrentParagraph;
      }
    }
  }

  /**
   * @param {HTMLElement | null} element
   * @return {number}
   */
  private getCaretCharacterOffsetWithin(element: HTMLElement | null): number {
    if (!element) {
      return -1;
    }
    let caretOffset = 0;
    const win = window;
    const sel = win.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  /**
   * @param {HTMLElement} element
   * @param {number} offset
   */
  private setCaretCharacterOffsetWithin(element: HTMLElement, offset: number): void {
    const createRange = (node: ChildNode, offset: number, range: Range | null): Range => {
      if (!range) {
        range = document.createRange();
        range.selectNode(node);
        range.setStart(node, 0);
      }

      if (offset === 0) {
        range.setEnd(node, offset);
      } else if (node && offset > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.length < offset) {
            offset -= node.textContent.length;
          } else {
            range.setEnd(node, offset);
            offset = 0;
          }
        } else {
          for (let lp = 0; lp < node.childNodes.length; lp++) {
            range = createRange(node.childNodes[lp], offset, range);

            if (offset === 0) {
              break;
            }
          }
        }
      }

      return range;
    };
    if (offset >= 0) {
      const selection = window.getSelection();
      const range = createRange(element, offset, null);

      if (range && selection) {
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
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
      htmlElementFromString(setting),
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
      this.setContent(this.getContent());
    } else {
      const newParagraphs: HTMLElement[] = [];
      for (const paragraph of this.editor.childNodes) {
        const element = paragraph as HTMLElement;
        const p = document.createElement('p');
        if (element.hasAttribute('data-text')) {
          const text = element.getAttribute('data-text');
          if (text) {
            p.innerText = text;
          }
        } else {
          p.innerText = element.innerText;
        }
        newParagraphs.push(p);
      }
      this.editor.innerHTML = '';
      for (const element of newParagraphs) {
        this.editor.appendChild(element);
      }
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
      CssInjector.injectCss('.md-token', {
        display: '',
      });
    } else {
      CssInjector.injectCss('.md-token', {
        display: 'none',
      });
    }
  }

  /** Handle array of Mutations
   * @param {MutationRecord[]} mutations array of mutations
   */
  private handleMutations(mutations: MutationRecord[]): void {
    mutations.map((mutation) => {
      if (mutation.type === 'childList') {
        this.handleChildListMutation(mutation);
      } else if (mutation.type === 'characterData') {
        // this.handleCharacterDataMutation(mutation);
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
      this.documentData.currentParagraph = newDiv;

      // Move cursor to end of line
      const range: Range = document.createRange();
      const sel: Selection | null = window.getSelection();
      range.setStart(this.editor.childNodes[0], newDiv.innerText.length);
      range.collapse(true);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if (addedNode.nodeName === '#text') {
      if (addedNode.nodeValue) {
        const currentText = (mutation.target as HTMLElement).getAttribute('data-text');
        if (currentText) {
          (mutation.target as HTMLElement).setAttribute('data-text', currentText + addedNode.nodeValue);
        }
      }
    }
  }
}
