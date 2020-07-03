type ReferenceData = {link: string; title: string};
type ReferenceDictionary = {[reference: string]: ReferenceData};
type HtmlTag = {openTag: string; closeTag: string};

/** Markdown compiler
 * The compiler holds document-specific data so each document must have
 * its own compiler object
 */
export class Compiler {
  /** Compile markdown document to html
   * @param {string} text is a markdown document
   * @return {string} compiled html
   */
  compileText(text: string): string {
    const paragraphs = this.splitStringToParagraphs(text);
    // const compiledParagraphs = paragraphs.map((paragraph) => this.compileParagraph(paragraph));
    let compiledParagraphs: string[] = [];
    for (const paragraph of paragraphs) {
      const compiled = this.compileParagraphPrefix(paragraph);
      if (typeof compiled === 'string') {
        compiledParagraphs.push(compiled);
      } else {
        this.references[compiled['reference']] = {link: compiled.link, title: compiled.title};
      }
    }

    compiledParagraphs = compiledParagraphs.map((paragraph) => {
      const inlineTokens = this.tokenizeParagraphForInfixCompilation(paragraph);
      let compiled = this.compileInfixTokens(inlineTokens);
      compiled = this.compileImage(compiled);
      compiled = this.compileLink(compiled);
      return compiled;
    });

    return compiledParagraphs.join('');
  }

  /** Compile one markdown block or line to html
   * @param {string} paragraph is one markdown block/line
   * @return {string} compiled html
   */
  compileParagraph(paragraph: string): string {
    let compiled = this.compileParagraphPrefix(paragraph);
    if (typeof compiled !== 'string') {
      this.references[compiled['reference']] = {link: compiled.link, title: compiled.title};
      return '';
    } else {
      const inlineTokens = this.tokenizeParagraphForInfixCompilation(compiled);
      compiled = this.compileInfixTokens(inlineTokens);
      compiled = this.compileImage(compiled);
      compiled = this.compileLink(compiled);
      return compiled;
    }
  }

  // Dictionary of document references and their values
  private references: ReferenceDictionary = {};

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
   * @return {string} html with compiled image tags
   */
  private compileImage(paragraph: string): string {
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
      if (this.references[ref] !== undefined) {
        link = this.references[ref].link !== undefined ? this.references[ref].link : '';
        title = this.references[ref].title !== undefined ? this.references[ref].title : '';
      }
      const htmlTag = `<img src="${link}" alt="${alt}" title="${title}" data-reference="${ref}">`;
      paragraph = paragraph.replace(match[0], htmlTag);
    }
    return paragraph;
  }

  /** Parse hyper links
   * @param {string} paragraph
   * @return {string} html with compiled link tags
   */
  private compileLink(paragraph: string): string {
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
        if (this.references[ref] !== undefined) {
          link = this.references[ref].link !== undefined ? this.references[ref].link : '';
          title = this.references[ref].title !== undefined ? this.references[ref].title : '';
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
  private compileParagraphPrefix(paragraph: string): string | {reference: string; link: string; title: string} {
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
          link: anchorParts[2] !== undefined ? anchorParts[2] : '',
          title: anchorParts[5] !== undefined ? anchorParts[5] : '',
        };
      }
    }

    return '<p>' + paragraph + '</p>';
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
