import {DOMHelper} from './DOMHelper';

interface HtmlTag {openTag: string; closeTag: string}

export interface ReferenceData {
  link: string;
  title: string;
}

export interface Reference {
  reference: string;
   data: ReferenceData;
  }

export interface ReferenceDictionary {
  [reference: string]: ReferenceData;
}

/** Markdown compiler
 * The compiler holds document-specific data so each document must have
 * its own compiler object
 */
export class Compiler {
  /** Compile markdown document to html
   * @param {string} text is a markdown document
   * @param {ReferenceDictionary} references
   * @return {string} compiled html
   */
  compileText(text: string, references: ReferenceDictionary):
      {html: HTMLElement[]; references: ReferenceDictionary} {
    const newReferences = references;
    const paragraphs = this.splitStringToParagraphs(text);
    const compiledElements: HTMLElement[] = [];
    for (const paragraph of paragraphs) {
      const element = this.compileParagraph(paragraph, newReferences);
      if (element instanceof HTMLElement) {
        compiledElements.push(element);
      } else {
        const reference = element;
        newReferences[reference.reference] = reference.data;
        this.fixReferences(compiledElements, reference);
      }
    }
    return {
      html: compiledElements,
      references: newReferences,
    };
  }

  /** Compile one markdown block or line to html
   * @param {string} paragraph is one markdown block/line
   * @param {ReferenceDictionary} references
   * @return {string} compiled html
   */
  compileParagraph(paragraph: string, references: ReferenceDictionary): HTMLElement | Reference {
    let compiled = this.compilePrefix(paragraph);
    if (typeof compiled !== 'string') {
      return compiled;
    } else {
      const inlineTokens = this.tokenizeParagraphForInfixCompilation(compiled);
      compiled = this.compileInfixTokens(inlineTokens);
      compiled = this.compileImage(compiled, references);
      compiled = this.compileLink(compiled, references);
      const div = document.createElement('div');
      div.appendChild(DOMHelper.htmlElementFromString(compiled));
      div.setAttribute('data-text', paragraph);
      return div;
    }
  }

  // Dictionary of infix formatters and their html tags
  private infixFormatters: {[token: string]: HtmlTag} = {
    '**': {openTag: '<strong>', closeTag: '</strong>'},
    '__': {openTag: '<strong>', closeTag: '</strong>'},
    '_': {openTag: '<em>', closeTag: '</em>'},
    '*': {openTag: '<em>', closeTag: '</em>'},
    '~~': {openTag: '<strike>', closeTag: '</strike>'},
    '`': {openTag: '<code>', closeTag: '</code>'},
  };

  // List of prefix formatters and their html tags
  private prefixFormatters: {regex: RegExp; openTag: string; closeTag: string}[] = [
    {regex: new RegExp('^# '), openTag: '<h1>', closeTag: '</h1>'},
    {regex: new RegExp('^## '), openTag: '<h2>', closeTag: '</h2>'},
    {regex: new RegExp('^### '), openTag: '<h3>', closeTag: '</h3>'},
    {regex: new RegExp('^#### '), openTag: '<h4>', closeTag: '</h4>'},
    {regex: new RegExp('^##### '), openTag: '<h5>', closeTag: '</h5>'},
    {regex: new RegExp('^###### '), openTag: '<h6>', closeTag: '</h6>'},
    {regex: new RegExp('^> '), openTag: '<blockquote>', closeTag: '</blockquote>'},
  ];

  /** Parse images
   * @param {string} paragraph
   * @param {ReferenceDictionary} references
   * @return {string} html with compiled image tags
   */
  private compileImage(paragraph: string, references: ReferenceDictionary): string {
    // Compile standard image tags
    const imageRegex = /!\[(.*?)\]\((.*?) ("(.*?)")\)?/g;
    for (const match of paragraph.matchAll(imageRegex)) {
      const alt = match[1] !== undefined ? match[1] : '';
      const link = match[2] !== undefined ? match[2] : '';
      const title = match[4] !== undefined ? match[4] : '';
      const htmlTag = `<img src="${link}" alt="${alt}" title="${title}">`;
      paragraph = paragraph.replace(match[0], htmlTag);
    }

    // Compile image tags with references
    const imageReferenceRegex = /!\[(.*?)\](\[(.*?)\])?/g;
    for (const match of paragraph.matchAll(imageReferenceRegex)) {
      const alt = match[1] !== undefined ? match[1] : '';
      const ref = match[3] !== undefined ? match[3] : '';
      let link = '';
      let title = '';
      if (references[ref] !== undefined) {
        link = references[ref].link !== undefined ? references[ref].link : '';
        title = references[ref].title !== undefined ? references[ref].title : '';
      }
      const htmlTag = `<img src="${link}" alt="${alt}" title="${title}" data-reference="${ref}">`;
      paragraph = paragraph.replace(match[0], htmlTag);
    }
    return paragraph;
  }

  /** Parse hyper links
   * @param {string} paragraph
   * @param {ReferenceDictionary} references
   * @return {string} html with compiled link tags
   */
  private compileLink(paragraph: string, references: ReferenceDictionary): string {
    const linkRegex = /\[(.*?)\](\((.*?)( "(.*)")?\)|\[(.*)\])?/g;
    for (const match of paragraph.matchAll(linkRegex)) {
      let htmlTag = match[0];
      const name = match[1] !== undefined ? match[1] : '';
      let link = match[3] !== undefined ? match[3] : '';
      let title = match[5] !== undefined ? match[5] : '';
      let ref = match[6] !== undefined ? match[6] : '';

      if (match[2] && match[2].startsWith('(')) { // Compile standard link tags
        htmlTag = `<a href="${link}" title="${title}">${name}</a>`;
      } else { // Compile link tags with references
        if (match[2] === undefined) { // Handle references the reference is the name
          ref = name;
        }
        if (references[ref] !== undefined) {
          link = references[ref].link !== undefined ? references[ref].link : '';
          title = references[ref].title !== undefined ? references[ref].title : '';
        }
        htmlTag = `<a href="${link}" title="${title}" data-reference="${ref}">${name}</a>`;
      }
      paragraph = paragraph.replace(match[0], htmlTag);
    }

    return paragraph;
  }

  /** Separate normal text from inline markdown formatters (e.g ** _ ~~)
   * @param {string} paragraph
   * @return {string[]} list of inline markdown tokens and normal strings
   */
  private tokenizeParagraphForInfixCompilation(paragraph: string): string[] {
    if (/^```/.test(paragraph)) {
      return [paragraph];
    }
    const tokens: string[] = [];

    const addDoubleToken = (char: string): void => {
      if (tokens[tokens.length - 1] === char) {
        tokens[tokens.length - 1] = char.repeat(2);
      } else {
        tokens.push(char);
      }
    };

    for (const char of paragraph) {
      if (tokens.length === 0) {
        tokens.push(char);
        continue;
      }

      if (char === '*' || char === '_' || char === '~') {
        addDoubleToken(char);
      } else if (char === '`') {
        tokens.push(char);
      } else {
        if (this.infixFormatters[tokens[tokens.length - 1]] !== undefined) {
          tokens.push(char);
        } else {
          tokens[tokens.length - 1] = tokens[tokens.length - 1].concat(char);
        }
      }
    }

    return tokens;
  }

  /** Compile a list of inline formatting tokens and strings to html
   * @param {string[]} tokens are a list of inline markdown tokens
   * @return {string} compiled html with inline markdown formatters
   */
  private compileInfixTokens(tokens: string[]): string {
    let compiled = '';
    const formatTokenSet = new Set();
    for (const token of tokens) {
      if (this.infixFormatters[token] !== undefined) {
        if (!formatTokenSet.has(token)) {
          formatTokenSet.add(token);
          compiled = compiled + this.infixFormatters[token].openTag + token;
        } else {
          formatTokenSet.delete(token);
          compiled = compiled + token + this.infixFormatters[token].closeTag;
        }
      } else {
        compiled = compiled + token;
      }
    }

    return compiled;
  }

  /** Compile markdown prefix formatters
   * @param {string} paragraph
   * @return {string} compiled html with prefix formatters
   */
  private compilePrefix(paragraph: string): string | Reference {
    for (const prefix of this.prefixFormatters) {
      if (prefix.regex.test(paragraph)) {
        return prefix.openTag + paragraph + prefix.closeTag;
      }
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(paragraph)) {
      return '<hr/>';
    }

    if (/^\[.*?\]:/.test(paragraph)) {
      const anchorRegex = /^\[(.*)\]:\s*([^"]*)(\s)?("(.*)")?/;
      const anchorParts = paragraph.match(anchorRegex);
      if (anchorParts && anchorParts[1] !== undefined) {
        return {
          reference: anchorParts[1],
          data: {
            link: anchorParts[2] !== undefined ? anchorParts[2] : '',
            title: anchorParts[5] !== undefined ? anchorParts[5] : '',
          },
        };
      }
    }

    return '<p>' + paragraph + '</p>';
  }

  /**
   * @param {HTMLElement[]} elements
   * @param {Reference} reference
   * @param {ReferenceDictionary} references
   */
  public fixReferences(elements: HTMLElement[], reference: Reference): void {
    elements.map((element) => element.querySelectorAll(`[data-reference="${reference.reference}"]`))
        .map((nodes) => {
          for (const node of nodes) {
            node.setAttribute('title', reference.data.title);
            if (node.tagName === 'A') {
              node.setAttribute('href', reference.data.link);
            } else if (node.tagName === 'IMG') {
              node.setAttribute('src', reference.data.link);
            }
          }
        });
  }

  /** Split a string to markdown paragraphs
   * @param {string} text markdown
   * @return {string[]} array of paragraphs
   */
  private splitStringToParagraphs(text: string): string[] {
    const lines = text.split('\n');
    const paragraphs: string[] = [];
    let paragraphBuffer = '';

    const appendBuffer = (): void => {
      if (paragraphBuffer.length != 0) {
        paragraphs.push(paragraphBuffer);
        paragraphBuffer = '';
      }
    };

    const specialParagraphStart = /^(#{1,6} |\d+\. |\* |\+ |- |> )/;
    const horizontalLine = /^(-{3,}|\*{3,}|_{3,})$/;
    const anchor = /^\[.+\]:/;
    for (const line of lines) {
      if (specialParagraphStart.test(line) || horizontalLine.test(line) ||
        anchor.test(line) || line.includes('|')) {
        appendBuffer();
        paragraphs.push(line);
      } else if (line.trim() === '') {
        appendBuffer();
      } else {
        paragraphBuffer = paragraphBuffer.concat(line);
      }
    }
    appendBuffer();

    return paragraphs;
  }
}
