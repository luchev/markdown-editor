import { Formatter } from './Formatter';
import { DOMHelper } from './DOMHelper';

/**
 * Markdown formatter which is based on the generic Formatter class
 * This formatter uses common Markdown syntax to
 */
export class MdFormatter extends Formatter {
  /**
   * List of rules which are applied to markdown elements which
   * start with a specific string
   * e.g headers "# " or "### "
   *
   * An array of [<class-name>, <regex-expression>] tuples.
   * <class-name> is the css class name added to the
   * element if it matches <regex-expression>
   */
  private static lineStartRules: [string, RegExp][] = [];

  /**
   * Inline MD rules are italic, bold, strikethrough
   * List of rules which are applied to inline markdown elements
   * e.g **this text will be bold**
   *
   * An array of [<class-name>, <inline-identifier>] tuples.
   * <class-name> is the css class name added to the
   * element if it is surrounded by <inline-identifier>
   */
  private static inlineRules: [string, string][] = [];

  /**
   * Hook to the editor div
   */
  private editor: HTMLElement = document.createElement('invalid');

  /**
   * Flag indicating whether formatting should be applied when text is inputted
   */
  private dynamicRender = true;

  /**
   * Flag indicating whether when leaving a paragraph the MD tokens should be hidden
   */
  private hideSyntax = true;

  /**
   * The current div which the caret is in
   */
  private caretDiv: HTMLElement | null = null;

  /**
   * Initialize the mutation observer, which monitors changes happening
   * inside the container
   * @param {HTMLElement} editor HTML editable div used as editor
   */
  init(editor: HTMLElement): void {
    this.editor = editor;
    this.initRegex();
    this.initMutationListeners();
    this.initKeyboardEventListeners();
    this.initMouseEventListeners();
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
      // attributes: true, // observe attribute change?
    };

    const observer = new MutationObserver((mutations) =>
      this.handleMutations(mutations)
    );

    observer.observe(this.editor, observerConfig);
  }

  /**
   * Initialize keyboard event listeners
   */
  private initKeyboardEventListeners(): void {
    this.editor.addEventListener('keydown', () => this.handleKeyDown());
    this.editor.addEventListener('keyup', () => this.handleKeyUp());
  }

  /**
   * Initialize keyboard event listeners
   */
  private initMouseEventListeners(): void {
    this.editor.addEventListener('click', () => this.handleClick());
  }

  /**
   * Handle hotkeys
   * @param {KeyboardEvent} event
   */
  private handleKeyDown(): void {
    // TODO add argument event: KeyboardEvent
    this.caretMoved();
  }

  /**
   * Handle hotkeys
   * @param {KeyboardEvent} event
   */
  private handleKeyUp(): void {
    // TODO add argument event: KeyboardEvent
    this.caretMoved();
  }

  /**
   * Find the div in which the caret is
   * @return {HTMLElement | null} the div in which the carret currently is or null if it's not in any
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

  /**
   * Handle caret entering a new div
   */
  private caretMoved(): void {
    const caretDiv = this.getCaretDiv();
    if (this.caretDiv !== caretDiv) {
      if (this.caretDiv) {
        this.caretDiv.setAttribute('data-active', 'false');
        if (this.hideSyntax) {
          this.hideMdTokens(this.caretDiv);
        }
      }

      this.caretDiv = caretDiv;

      if (this.caretDiv) {
        this.caretDiv.setAttribute('data-active', 'true');
        if (this.hideSyntax) {
          this.showMdTokens(this.caretDiv);
        }
      }
    }
  }

  /**
   * @param {string} text text to apply regex to
   * @param {RegExp} regex
   * @return {string} length of first regex match
   */
  private getFirstRegexMatch(text: string, regex: RegExp): string {
    const matches = text.match(regex);
    if (matches && matches.length === 1) {
      return matches[0];
    }
    return '';
  }

  /**
   * @param {HTMLElement} div elemet in which to show MD tokens
   */
  private showMdTokens(div: HTMLElement): void {
    for (const child of div.children) {
      if (child instanceof HTMLElement && child.tagName === 'SPAN') {
        const span = child as HTMLElement;
        if (span.style.display === 'none') {
          const spanText = span.innerText;
          span.replaceWith(spanText);
        }
      }
    }
    div.normalize();
  }

  /**
   * @param {HTMLElement} div elemet in which to hide MD tokens
   */
  private hideMdTokens(div: HTMLElement): void {
    // Hide start of row MD tokens
    for (const [, regex] of MdFormatter.lineStartRules) {
      if (regex.test(div.innerText)) {
        const lineStart = this.getFirstRegexMatch(div.innerText, regex);
        div.innerText = div.innerText.replace(lineStart, '');

        const span = document.createElement('span');
        span.style.display = 'none';
        span.innerText = lineStart;

        div.prepend(span);
        break;
      }
    }
  }

  /**
   * Handle mouse click in the editor
   * @param {MouseEvent} event
   */
  private handleClick(): void {
    this.caretMoved();
  }

  /**
   * Get list of property elements to put in the settings menu in the editor
   * @return {HTMLElement[]} List of settings as div elements
   */
  getSettings(): HTMLElement[] {
    const settingsHtml = [
      `
      <div data-setting="dynamic-render" style='display: flex; flex-direction: row; justify-items: center; justify-content: space-between; margin-top: 20px;'>
        <div style='display: flex;'>
          Dynamic render
        </div>
        <div style='display: flex;'>
          <svg display="none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>
      `,
      `
      <div data-setting="hide-syntax" style='display: flex; flex-direction: row; justify-items: center; justify-content: space-between; margin-top: 20px;'>
        <div style='display: flex;'>
          Hide syntax
        </div>
        <div style='display: flex;'>
          <svg display="none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>
      `,
    ];

    const settingsElements = settingsHtml.map((setting) =>
      DOMHelper.htmlElementFromString(setting)
    );

    // TODO convert the following foreach to event delegation
    settingsElements.forEach((element) => {
      if (element.hasAttribute('data-setting')) {
        if (element.getAttribute('data-setting') === 'dynamic-render') {
          element.addEventListener('click', (event: MouseEvent) =>
            this.toggleDynamicRender(event)
          );
        } else if (element.getAttribute('data-setting') === 'hide-syntax') {
          element.addEventListener('click', (event: MouseEvent) =>
            this.toggleHideSyntax(event)
          );
        }
      }
    });

    return settingsElements;
  }

  /**
   * Method to handle the click event on the setting Toggle Dynamic Renderer
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

    this.dynamicRender = !this.dynamicRender;
    if (this.dynamicRender) {
      this.enableRendering();
    } else {
      this.disableRendering();
    }
  }

  /**
   * Method to handle the click event on the setting Toggle Dynamic Renderer
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

    this.hideSyntax = !this.hideSyntax;
    if (this.hideSyntax) {
      this.enableHideSyntax();
    } else {
      this.disableHideSyntax();
    }
  }

  /**
   * Enable hiding syntax, aka MD identifiers like "# " and "** <some-text> **"
   */
  private enableHideSyntax(): void {
    for (const element of this.editor.children) {
      if (element instanceof HTMLElement) {
        this.hideMdTokens(element as HTMLElement);
      }
    }
  }

  /**
   * Disable hiding syntax, aka MD identifiers like "# " and "** <some-text> **"
   */
  private disableHideSyntax(): void {
    for (const element of this.editor.children) {
      if (element instanceof HTMLElement) {
        this.showMdTokens(element as HTMLElement);
      }
    }
  }

  /**
   * Initialize regexes for matching markdown formatting strings
   * at the start of the line
   * e.g headers # and ###
   */
  private initRegex(): void {
    if (MdFormatter.lineStartRules.length === 0) {
      MdFormatter.lineStartRules.push(['md-header-1', RegExp('^#{1}\\s')]);
      MdFormatter.lineStartRules.push(['md-header-2', RegExp('^#{2}\\s')]);
      MdFormatter.lineStartRules.push(['md-header-3', RegExp('^#{3}\\s')]);
      MdFormatter.lineStartRules.push(['md-header-4', RegExp('^#{4}\\s')]);
      MdFormatter.lineStartRules.push(['md-header-5', RegExp('^#{5}\\s')]);
      MdFormatter.lineStartRules.push(['md-header-6', RegExp('^#{6}\\s')]);
      MdFormatter.lineStartRules.push(['md-quote', RegExp('^>\\s')]);
    }
  }

  /**
   *
   */
  private initInlineRules(): void {
    if (MdFormatter.inlineRules.length === 0) {
      MdFormatter.inlineRules.push(['md-bold', '**']);
      MdFormatter.inlineRules.push(['md-bold', '__']);
      MdFormatter.inlineRules.push(['md-italics', '*']);
      MdFormatter.inlineRules.push(['md-italics', '_']);
      MdFormatter.inlineRules.push(['md-strikethrough', '--']);
    }
  }

  /**
   * Handle array of Mutations
   * @param {MutationRecord[]} mutations array of mutations
   */
  private handleMutations(mutations: MutationRecord[]): void {
    if (this.dynamicRender) {
      for (const mutation of mutations) {
        this.handleMutation(mutation);
      }
    }
  }

  /**
   * Handle a single mutation by calling the right method depending on the mutation type
   * @param {MutationRecord} mutation Mutation to parse
   */
  private handleMutation(mutation: MutationRecord): void {
    if (mutation.type === 'childList') {
      this.handleChildListMutation(mutation);
    }

    if (mutation.type === 'characterData') {
      this.handleCharacterDataMutation(mutation);
    }
  }

  /**
   * Handle a single Mutation of type childList
   * @param {MutationRecord} mutation The mutation that happened
   */
  private handleChildListMutation(mutation: MutationRecord): void {
    if (mutation.addedNodes.length > 0) {
      const addedNode: Node = mutation.addedNodes[0];

      // Add first div if the editor is empty and this is the first addedd #text
      // The first text written will not be in a separate div, so create a div for it
      // and put the text inside
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

      // If added node is a div, clear all classes
      if (addedNode.nodeName === 'DIV' && mutation.target !== this.editor) {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          const elementFromNode: HTMLElement = addedNode as HTMLElement;
          while (elementFromNode.hasAttributes()) {
            elementFromNode.removeAttribute(elementFromNode.attributes[0].name);
          }
        }
      }
    }

    // Check if the element is empty and clear its classes
    if (
      mutation.target.nodeType === Node.ELEMENT_NODE &&
      mutation.target !== this.editor
    ) {
      const elementFromNode = mutation.target as HTMLElement;

      if (elementFromNode) {
        const spacesRegex = RegExp('^\\s*$');
        if (spacesRegex.test(elementFromNode.innerText)) {
          this.clearDivFormatting(elementFromNode);
        }
      }
    }
  }

  /**
   * Handle a single Mutation of type characterData
   * @param {MutationRecord} mutation The mutation that happened
   */
  private handleCharacterDataMutation(mutation: MutationRecord): void {
    const div = mutation.target.parentElement;
    if (div && this.dynamicRender) {
      this.clearDivFormatting(div);
      this.applyDivFormatting(div);
    }
  }

  /**
   * Disable and Remove all formatting
   */
  private disableRendering(): void {
    for (const child of this.editor.children) {
      if (child instanceof HTMLElement) {
        const div = child as HTMLElement;
        this.clearDivFormatting(div);
      }
    }
  }

  /**
   * Enable and apply all formatting
   */
  private enableRendering(): void {
    for (const child of this.editor.children) {
      if (child instanceof HTMLElement) {
        const div = child as HTMLElement;
        this.applyDivFormatting(div);
      }
    }
  }

  /**
   * Add specific MD formatting to a single div(paragraph)
   * @param {HTMLElement} div the element to apply specific formatting
   */
  private applyDivFormatting(div: HTMLElement): void {
    for (const [className, regex] of MdFormatter.lineStartRules) {
      if (regex.test(div.innerText)) {
        div.className = className;
      }
    }
  }

  /**
   * Clear MD formatting from a single element(paragraph)
   * @param {HTMLElement} div the element to apply specific formatting
   */
  private clearDivFormatting(div: HTMLElement): void {
    div.className = '';
  }
}
