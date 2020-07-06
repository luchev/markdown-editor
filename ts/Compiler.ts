import {htmlElementFromString} from './HtmlGeneration';

interface HtmlTag {openTag: string; closeTag: string}

export interface ReferenceData {
  link: string;
  title: string;
}

export interface Reference {
  name: string;
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
   * @param {ReferenceDictionary} startingReferences
   * @return {string} compiled html
   */
  compileText(text: string, startingReferences: ReferenceDictionary): {html: HTMLElement[]; references: ReferenceDictionary} {
    const newReferences = startingReferences;
    const paragraphs = this.splitStringToParagraphs(text);
    const compiledElements: HTMLElement[] = [];
    for (const paragraph of paragraphs) {
      const compiled = this.compileParagraph(paragraph, newReferences);
      compiledElements.push(compiled.html);
      if (compiled.reference) {
        newReferences[compiled.reference.name] = compiled.reference.data;
        this.fixReferences(compiledElements, compiled.reference);
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
  compileParagraph(paragraph: string, references: ReferenceDictionary): {html: HTMLElement; reference?: Reference} {
    const compiled = this.compilePrefix(paragraph);
    if (compiled.reference) {
      return {
        html: htmlElementFromString('<p>' + compiled.str + '<p>'),
        reference: compiled.reference,
      };
    } else {
      const inlineTokens = this.tokenizeParagraphForInfixCompilation(compiled.str);
      compiled.str = this.compileInfixTokens(inlineTokens);
      compiled.str = this.compileImage(compiled.str, references);
      compiled.str = this.compileLink(compiled.str, references);
      const element = htmlElementFromString(compiled.str);
      element.setAttribute('data-text', paragraph);
      element.classList.add('md');
      return {html: element};
    }
  }

  // Tags to surround markdown format tokens with
  private tokenHtmlTag: HtmlTag = {
    openTag: '<span class="md-token">',
    closeTag: '</span>',
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
    {regex: new RegExp('^- '), openTag: '<li>', closeTag: '</li>'},
    {regex: new RegExp('^\\* '), openTag: '<li>', closeTag: '</li>'},
    {regex: new RegExp('^\\+ '), openTag: '<li>', closeTag: '</li>'},
    {regex: new RegExp('^[0-9]+\\. '), openTag: '<li style="list-style:decimal">', closeTag: '</li>'},
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
      const htmlTag = `<img src="${link}" alt="${alt}" title="${title}" class="md">`;
      paragraph = paragraph.replace(match[0], htmlTag);
    }

    // Compile image tags with references
    const imageReferenceRegex = /!\[(.*?)\](\[(.*?)\])?/g;
    for (const match of paragraph.matchAll(imageReferenceRegex)) {
      const alt = match[1] !== undefined ? match[1] : '';
      const ref = match[3] !== undefined ? match[3] : '';
      let link = '';
      let title = '';
      console.log(match);
      console.log(link.replace(/<.*?>/, ''));
      if (references[ref] !== undefined) {
        link = references[ref].link !== undefined ? references[ref].link : '';
        title = references[ref].title !== undefined ? references[ref].title : '';
      }
      const htmlTag = `<img src="${link}" alt="${alt}" title="${title}" data-reference="${ref}" class="md">`;
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

    if (/^<li>\* /.test(paragraph)) {
      paragraph = paragraph.substr(6);
      tokens.push('<li>* ');
    }

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
          compiled = compiled +
            this.infixFormatters[token].openTag + this.tokenHtmlTag.openTag + token +
            this.tokenHtmlTag.closeTag;
        } else {
          formatTokenSet.delete(token);
          compiled = compiled + this.tokenHtmlTag.openTag + token + this.tokenHtmlTag.closeTag +
            this.infixFormatters[token].closeTag;
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
  private compilePrefix(paragraph: string): {str: string; reference?: Reference} {
    for (const prefix of this.prefixFormatters) {
      if (prefix.regex.test(paragraph)) {
        const prefixMatch = paragraph.match(prefix.regex);
        if (prefixMatch) {
          const prefixString = prefixMatch[0];
          const paragraphWithoutPrefixFormatter = paragraph.substr(prefixString.length);
          const paragraphContent = this.tokenHtmlTag.openTag + prefixString + this.tokenHtmlTag.closeTag +
            paragraphWithoutPrefixFormatter;
          return {str: prefix.openTag + paragraphContent + prefix.closeTag};
        }
      }
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(paragraph)) {
      return {str: '<hr/>'};
    }

    if (/^\[.*?\]:/.test(paragraph)) {
      const anchorRegex = /^\[(.*)\]:\s*([^"]*)(\s)?("(.*)")?/;
      const anchorParts = paragraph.match(anchorRegex);
      if (anchorParts && anchorParts[1] !== undefined) {
        return {
          str: paragraph,
          reference: {
            name: anchorParts[1],
            data: {
              link: anchorParts[2] !== undefined ? anchorParts[2] : '',
              title: anchorParts[5] !== undefined ? anchorParts[5] : '',
            },
          },
        };
      }
    }

    return {str: '<p>' + paragraph + '</p>'};
  }

  /**
   * @param {HTMLElement[]} elements
   * @param {Reference} reference
   * @param {ReferenceDictionary} references
   */
  public fixReferences(elements: HTMLElement[], reference: Reference): void {
    elements.map((element) => element.querySelectorAll(`[data-reference="${reference.name}"]`))
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
