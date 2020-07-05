
class Compiler {
    constructor() {
        this.infixFormatters = {
            '**': { openTag: '<strong>', closeTag: '</strong>' },
            '__': { openTag: '<strong>', closeTag: '</strong>' },
            '_': { openTag: '<em>', closeTag: '</em>' },
            '*': { openTag: '<em>', closeTag: '</em>' },
            '~~': { openTag: '<strike>', closeTag: '</strike>' },
            '`': { openTag: '<code>', closeTag: '</code>' },
        };
        this.prefixFormatters = [
            { regex: new RegExp('^# '), openTag: '<h1>', closeTag: '</h1>' },
            { regex: new RegExp('^## '), openTag: '<h2>', closeTag: '</h2>' },
            { regex: new RegExp('^### '), openTag: '<h3>', closeTag: '</h3>' },
            { regex: new RegExp('^#### '), openTag: '<h4>', closeTag: '</h4>' },
            { regex: new RegExp('^##### '), openTag: '<h5>', closeTag: '</h5>' },
            { regex: new RegExp('^###### '), openTag: '<h6>', closeTag: '</h6>' },
            { regex: new RegExp('^> '), openTag: '<blockquote>', closeTag: '</blockquote>' },
        ];
    }
    compileText(text, references) {
        const newReferences = references;
        const paragraphs = this.splitStringToParagraphs(text);
        const compiledElements = [];
        for (const paragraph of paragraphs) {
            const element = this.compileParagraph(paragraph, newReferences);
            if (element instanceof HTMLElement) {
                compiledElements.push(element);
            }
            else {
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
    compileParagraph(paragraph, references) {
        let compiled = this.compilePrefix(paragraph);
        if (typeof compiled !== 'string') {
            return compiled;
        }
        else {
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
    compileImage(paragraph, references) {
        const imageRegex = /!\[(.*?)\]\((.*?) ("(.*?)")\)?/g;
        for (const match of paragraph.matchAll(imageRegex)) {
            const alt = match[1] !== undefined ? match[1] : '';
            const link = match[2] !== undefined ? match[2] : '';
            const title = match[4] !== undefined ? match[4] : '';
            const htmlTag = `<img src="${link}" alt="${alt}" title="${title}">`;
            paragraph = paragraph.replace(match[0], htmlTag);
        }
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
    compileLink(paragraph, references) {
        const linkRegex = /\[(.*?)\](\((.*?)( "(.*)")?\)|\[(.*)\])?/g;
        for (const match of paragraph.matchAll(linkRegex)) {
            let htmlTag = match[0];
            const name = match[1] !== undefined ? match[1] : '';
            let link = match[3] !== undefined ? match[3] : '';
            let title = match[5] !== undefined ? match[5] : '';
            let ref = match[6] !== undefined ? match[6] : '';
            if (match[2] && match[2].startsWith('(')) {
                htmlTag = `<a href="${link}" title="${title}">${name}</a>`;
            }
            else {
                if (match[2] === undefined) {
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
    tokenizeParagraphForInfixCompilation(paragraph) {
        if (/^```/.test(paragraph)) {
            return [paragraph];
        }
        const tokens = [];
        const addDoubleToken = (char) => {
            if (tokens[tokens.length - 1] === char) {
                tokens[tokens.length - 1] = char.repeat(2);
            }
            else {
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
            }
            else if (char === '`') {
                tokens.push(char);
            }
            else {
                if (this.infixFormatters[tokens[tokens.length - 1]] !== undefined) {
                    tokens.push(char);
                }
                else {
                    tokens[tokens.length - 1] = tokens[tokens.length - 1].concat(char);
                }
            }
        }
        return tokens;
    }
    compileInfixTokens(tokens) {
        let compiled = '';
        const formatTokenSet = new Set();
        for (const token of tokens) {
            if (this.infixFormatters[token] !== undefined) {
                if (!formatTokenSet.has(token)) {
                    formatTokenSet.add(token);
                    compiled = compiled + this.infixFormatters[token].openTag + token;
                }
                else {
                    formatTokenSet.delete(token);
                    compiled = compiled + token + this.infixFormatters[token].closeTag;
                }
            }
            else {
                compiled = compiled + token;
            }
        }
        return compiled;
    }
    compilePrefix(paragraph) {
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
    fixReferences(elements, reference) {
        elements.map((element) => element.querySelectorAll(`[data-reference="${reference.reference}"]`))
            .map((nodes) => {
            for (const node of nodes) {
                node.setAttribute('title', reference.data.title);
                if (node.tagName === 'A') {
                    node.setAttribute('href', reference.data.link);
                }
                else if (node.tagName === 'IMG') {
                    node.setAttribute('src', reference.data.link);
                }
            }
        });
    }
    splitStringToParagraphs(text) {
        const lines = text.split('\n');
        const paragraphs = [];
        let paragraphBuffer = '';
        const appendBuffer = () => {
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
            }
            else if (line.trim() === '') {
                appendBuffer();
            }
            else {
                paragraphBuffer = paragraphBuffer.concat(line);
            }
        }
        appendBuffer();
        return paragraphs;
    }
}
class CssHelper {
    constructor() {
        CssHelper.styleElement = document.createElement('style');
        CssHelper.styleElement.type = 'text/css';
        document
            .getElementsByTagName('head')[0]
            .appendChild(CssHelper.styleElement);
    }
    static injectCss(identifier, properties) {
        const cssTextPropertoes = CssHelper.stringifyCSSProperties(properties);
        CssHelper.styleElement.innerHTML +=
            `${identifier} { ${cssTextPropertoes} } \n`;
    }
    static stringifyCSSProperties(property) {
        let cssString = '';
        Object.entries(property).forEach(([key, value]) => {
            if (value !== '') {
                cssString += `${key}: ${value}; `;
            }
        });
        return cssString;
    }
}
CssHelper.instance = new CssHelper();
class CssRules {
    constructor() {
        this.rules = {};
    }
}
class DOMHelper {
    static htmlElementFromString(html) {
        const creationHelperElement = document.createElement('div');
        creationHelperElement.innerHTML = html.trim();
        if (creationHelperElement.firstChild &&
            creationHelperElement.firstChild.nodeType === Node.ELEMENT_NODE) {
            return creationHelperElement.firstChild;
        }
        throw new Error('Failed to create element from html: ' + html);
    }
}


class Editor {
    constructor(containerId, formatter, theme) {
        this.formatter = formatter;
        this.theme = theme;
        this.container = document.createElement('div');
        this.editor = document.createElement('div');
        this.menu = document.createElement('div');
        this.idPrefix = containerId;
        this.initializeContainer(this.idPrefix);
        this.applyTheme();
        this.formatter.init(this.editor);
    }
    setContent(content) {
        this.formatter.setContent(content);
    }
    getContent() {
        return this.formatter.getContent();
    }
    injectAdditionalCssRules() {
        if (this.theme.additionalCssRules) {
            Object.entries(this.theme.additionalCssRules.rules).forEach(([identifier, properties]) => {
                CssHelper.injectCss(identifier, properties);
            });
        }
    }
    injectScrollbarTheme() {
        if (this.theme.scrollbarTheme) {
            Object.entries(this.theme.scrollbarTheme).forEach(([identifier, properties]) => {
                const cssIdentifier = '#' + this.getEditorId() + '::' + identifier;
                CssHelper.injectCss(cssIdentifier, properties);
            });
        }
    }
    createContainerId() {
        this.container.id = this.idPrefix;
        this.container.id = this.getContainerId();
    }
    createContainer(futureContainerId) {
        const futureContainer = document.getElementById(futureContainerId);
        if (!futureContainer) {
            throw new Error('Cannot find element with id ' + futureContainerId);
        }
        const futureContainerParent = futureContainer.parentElement;
        if (!futureContainerParent) {
            throw new Error('Cannot find parent of element with id ' + futureContainerId);
        }
        this.createContainerId();
        futureContainerParent.replaceChild(this.container, futureContainer);
    }
    createMenu() {
        this.createMenuBase();
        this.createMenuSettingsItems();
    }
    createMenuBase() {
        this.container.appendChild(this.menu);
        this.menu.id = this.getMenuId();
        const settingsSvg = DOMHelper.htmlElementFromString(`
        <div style='display: flex; justify-content: flex-end;'>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
          </svg>
          <svg display='none' width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>`);
        this.menu.appendChild(settingsSvg);
        settingsSvg.addEventListener('click', (event) => {
            this.settingsClick(event, this.menu);
        });
    }
    createMenuSettingsItems() {
        const settingsContainer = document.createElement('div');
        this.menu.appendChild(settingsContainer);
        settingsContainer.style.display = 'none';
        settingsContainer.style.flexDirection = 'column';
        this.formatter
            .getSettings()
            .forEach((element) => settingsContainer.appendChild(element));
    }
    createEditor() {
        this.container.appendChild(this.editor);
        this.editor.id = this.getEditorId();
        this.editor.contentEditable = 'true';
    }
    initializeContainer(futureContainerId) {
        this.createContainer(futureContainerId);
        this.createMenu();
        this.createEditor();
    }
    settingsClick(event, menu) {
        const target = event.currentTarget;
        if (target.parentElement) {
            const svgs = target.children;
            for (const svg of svgs) {
                if (svg.hasAttribute('display')) {
                    svg.removeAttribute('display');
                }
                else {
                    svg.setAttribute('display', 'none');
                }
            }
            if (target.parentElement.style.width === '') {
                target.parentElement.style.width = '250px';
                menu.children[1].style.display = 'flex';
            }
            else {
                target.parentElement.style.width = '';
                menu.children[1].style.display = 'none';
            }
        }
    }
    applyTheme() {
        this.injectContainerTheme();
        this.injectMenuCss();
        this.injectEditorCss();
        this.injectScrollbarTheme();
        this.injectAdditionalCssRules();
    }
    injectEditorCss() {
        CssHelper.injectCss(this.getEditorIdentifier(), this.getEditorBaseCssProperties());
    }
    injectMenuCss() {
        CssHelper.injectCss(this.getMenuIdentifier(), this.getMenuBaseCssProperties());
    }
    injectContainerTheme() {
        const containerCss = this.getContainerCssProperties();
        CssHelper.injectCss(this.getContainerIdentifier(), containerCss);
    }
    getContainerCssProperties() {
        if (this.theme.editorTheme) {
            return {
                ...this.getContainerBaseCssProperties(),
                ...this.theme.editorTheme,
            };
        }
        return this.getContainerBaseCssProperties();
    }
    getContainerBaseCssProperties() {
        return {
            'cursor': 'default',
            'display': 'flex',
            'flex-direction': 'row',
            'resize': 'both',
            'overflow': 'auto',
        };
    }
    getMenuBaseCssProperties() {
        return {
            'border-right': '1px solid rgb(83, 79, 86)',
            'margin': '20px 0px 20px 0px',
            'padding': '15px 20px 15px 20px',
            'display': 'flex',
            'flex-direction': 'column',
        };
    }
    getEditorBaseCssProperties() {
        return {
            'flex': '1',
            'outline': 'none',
            'overflow': 'auto',
            'scrollbar-color': 'red',
            'padding': '20px 30px 20px 30px',
            'margin': '10px 10px 10px 10px',
        };
    }
    getContainerIdentifier() {
        return '#' + this.getContainerId();
    }
    getMenuIdentifier() {
        return '#' + this.getMenuId();
    }
    getEditorIdentifier() {
        return '#' + this.getEditorId();
    }
    getContainerId() {
        return this.idPrefix + '-container';
    }
    getMenuId() {
        return this.idPrefix + '-menu';
    }
    getEditorId() {
        return this.idPrefix + '-editor';
    }
}
class Formatter {
}
var SpecialKey;
(function (SpecialKey) {
    SpecialKey[SpecialKey["esc"] = 27] = "esc";
    SpecialKey[SpecialKey["tab"] = 9] = "tab";
    SpecialKey[SpecialKey["space"] = 32] = "space";
    SpecialKey[SpecialKey["return"] = 13] = "return";
    SpecialKey[SpecialKey["enter"] = 13] = "enter";
    SpecialKey[SpecialKey["backspace"] = 8] = "backspace";
    SpecialKey[SpecialKey["scrollLock"] = 145] = "scrollLock";
    SpecialKey[SpecialKey["capsLock"] = 20] = "capsLock";
    SpecialKey[SpecialKey["numLock"] = 144] = "numLock";
    SpecialKey[SpecialKey["pause"] = 19] = "pause";
    SpecialKey[SpecialKey["insert"] = 45] = "insert";
    SpecialKey[SpecialKey["home"] = 36] = "home";
    SpecialKey[SpecialKey["delete"] = 46] = "delete";
    SpecialKey[SpecialKey["end"] = 35] = "end";
    SpecialKey[SpecialKey["pageUp"] = 33] = "pageUp";
    SpecialKey[SpecialKey["pageDown"] = 34] = "pageDown";
    SpecialKey[SpecialKey["left"] = 37] = "left";
    SpecialKey[SpecialKey["up"] = 38] = "up";
    SpecialKey[SpecialKey["right"] = 39] = "right";
    SpecialKey[SpecialKey["down"] = 40] = "down";
    SpecialKey[SpecialKey["f1"] = 112] = "f1";
    SpecialKey[SpecialKey["f2"] = 113] = "f2";
    SpecialKey[SpecialKey["f3"] = 114] = "f3";
    SpecialKey[SpecialKey["f4"] = 115] = "f4";
    SpecialKey[SpecialKey["f5"] = 116] = "f5";
    SpecialKey[SpecialKey["f6"] = 117] = "f6";
    SpecialKey[SpecialKey["f7"] = 118] = "f7";
    SpecialKey[SpecialKey["f8"] = 119] = "f8";
    SpecialKey[SpecialKey["f9"] = 120] = "f9";
    SpecialKey[SpecialKey["f10"] = 121] = "f10";
    SpecialKey[SpecialKey["f11"] = 122] = "f11";
    SpecialKey[SpecialKey["f12"] = 123] = "f12";
})(SpecialKey || (SpecialKey = {}));


var MdCss;
(function (MdCss) {
    MdCss["header1"] = ".md-header-1";
    MdCss["header2"] = ".md-header-2";
    MdCss["header3"] = ".md-header-3";
    MdCss["header4"] = ".md-header-4";
    MdCss["header5"] = ".md-header-5";
    MdCss["header6"] = ".md-header-6";
    MdCss["italics"] = ".md-italics";
    MdCss["bold"] = ".md-bold";
    MdCss["strikethrough"] = ".md-strikethrough";
    MdCss["orderedList"] = ".md-ordered-list";
    MdCss["unorderedList"] = ".md-unordered-list";
    MdCss["link"] = ".md-link";
    MdCss["image"] = ".md-image";
    MdCss["inlineCode"] = ".md-inline-code";
    MdCss["blockCode"] = ".md-block-code";
    MdCss["tableHeader"] = ".md-table-header";
    MdCss["tableCell"] = ".md-table-cell";
    MdCss["quote"] = ".md-quote";
    MdCss["horizontalLine"] = ".md-horizontal-line";
})(MdCss || (MdCss = {}));
class MdCssRules extends CssRules {
    constructor() {
        super(...arguments);
        this.rules = {
            '.md-header-1': {},
            '.md-header-2': {},
            '.md-header-3': {},
            '.md-header-4': {},
            '.md-header-5': {},
            '.md-header-6': {},
            '.md-italics': {},
            '.md-bold': {},
            '.md-strikethrough': {},
            '.md-ordered-list': {},
            '.md-unordered-list': {},
            '.md-link': {},
            '.md-image': {},
            '.md-inline-code': {},
            '.md-block-code': {},
            '.md-table-header': {},
            '.md-table-cell': {},
            '.md-quote': {},
            '.md-horizontal-line': {},
        };
    }
}



class MdFormatter extends Formatter {
    constructor() {
        super(...arguments);
        this.editor = document.createElement('invalid');
        this.settings = {
            dynamicRender: true,
            showSyntax: true,
        };
        this.documentData = {
            currentParagraph: null,
            references: {},
        };
        this.compiler = new Compiler();
    }
    init(editor) {
        this.editor = editor;
        this.initMutationListeners();
        this.initKeyboardEventListeners();
        this.initMouseEventListeners();
    }
    setContent(content) {
        const { html, references } = this.compiler.compileText(content, {});
        this.editor.innerHTML = '';
        for (const div of html) {
            this.editor.appendChild(div);
        }
        this.documentData.references = references;
    }
    getContent() {
        const content = '';
        return content;
    }
    initMutationListeners() {
        const observerConfig = {
            childList: true,
            subtree: true,
            characterData: true,
        };
        const observer = new MutationObserver((mutations) => this.handleMutations(mutations));
        observer.observe(this.editor, observerConfig);
    }
    initKeyboardEventListeners() {
        this.editor.addEventListener('keyup', () => this.handleKeyUp());
    }
    initMouseEventListeners() {
        this.editor.addEventListener('click', () => this.handleClick());
    }
    handleKeyUp() {
        this.caretMoved();
    }
    getCaretDiv() {
        let element = document.getSelection()?.anchorNode
            ?.parentElement;
        if (element) {
            while (element.parentElement && element.parentElement !== this.editor) {
                element = element.parentElement;
            }
        }
        if (element.parentElement === this.editor) {
            return element;
        }
        else {
            return null;
        }
    }
    caretMoved() {
        const newCurrentParagraph = this.getCaretDiv();
        if (this.documentData.currentParagraph !== newCurrentParagraph) {
            if (this.documentData.currentParagraph) {
                this.documentData.currentParagraph.setAttribute('data-active', 'false');
                this.documentData.currentParagraph.setAttribute('data-text', this.documentData.currentParagraph.innerText);
                const compiled = this.compiler.compileParagraph(this.documentData.currentParagraph.innerText, this.documentData.references);
                if (compiled instanceof HTMLElement) {
                    this.documentData.currentParagraph.innerHTML = '';
                    this.documentData.currentParagraph.appendChild(compiled);
                }
                else {
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
    handleClick() {
        this.caretMoved();
    }
    getSettings() {
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
        const settingsElements = settingsHtml.map((setting) => DOMHelper.htmlElementFromString(setting));
        settingsElements.forEach((element) => {
            if (element.hasAttribute('data-setting')) {
                if (element.getAttribute('data-setting') === 'dynamic-render') {
                    element.addEventListener('click', (event) => this.toggleDynamicRender(event));
                }
                else if (element.getAttribute('data-setting') === 'hide-syntax') {
                    element.addEventListener('click', (event) => this.toggleHideSyntax(event));
                }
            }
        });
        return settingsElements;
    }
    toggleDynamicRender(event) {
        const settingsItem = event.currentTarget;
        const svgs = settingsItem?.children[1].children;
        for (const svg of svgs) {
            if (svg.hasAttribute('display')) {
                svg.removeAttribute('display');
            }
            else {
                svg.setAttribute('display', 'none');
            }
        }
        this.settings.dynamicRender = !this.settings.dynamicRender;
        if (this.settings.dynamicRender) {
            this.enableRendering();
        }
        else {
            this.disableRendering();
        }
    }
    toggleHideSyntax(event) {
        const settingsItem = event.currentTarget;
        const svgs = settingsItem?.children[1].children;
        for (const svg of svgs) {
            if (svg.hasAttribute('display')) {
                svg.removeAttribute('display');
            }
            else {
                svg.setAttribute('display', 'none');
            }
        }
        this.settings.showSyntax = !this.settings.showSyntax;
        if (this.settings.showSyntax) {
            this.enableHideSyntax();
        }
        else {
            this.disableHideSyntax();
        }
    }
    enableHideSyntax() {
        this.settings.showSyntax = true;
    }
    disableHideSyntax() {
        this.settings.showSyntax = false;
    }
    handleMutations(mutations) {
        mutations.map((mutation) => {
            if (mutation.type === 'childList') {
                this.handleChildListMutation(mutation);
            }
            else if (mutation.type === 'characterData') {
                this.handleCharacterDataMutation(mutation);
            }
        });
    }
    handleChildListMutation(mutation) {
        if (mutation.addedNodes.length === 0) {
            return;
        }
        const addedNode = mutation.addedNodes[0];
        if (addedNode.nodeName === '#text' &&
            addedNode.parentElement === this.editor) {
            const newDiv = document.createElement('div');
            this.editor.insertBefore(newDiv, addedNode.nextSibling);
            newDiv.appendChild(addedNode);
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(this.editor.childNodes[0], newDiv.innerText.length);
            range.collapse(true);
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
    handleCharacterDataMutation(mutation) {
        const element = mutation.target.parentElement;
    }
    disableRendering() {
        this.settings.dynamicRender = false;
    }
    enableRendering() {
        this.settings.dynamicRender = true;
    }
}

const darkMDFormatterTheme = new MdCssRules();
darkMDFormatterTheme.rules[MdCss.header1] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '2em',
    'padding-bottom': '.3em',
    'border-bottom': '1px solid #eaecef',
};
darkMDFormatterTheme.rules[MdCss.header2] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'padding-bottom': '.3em',
    'border-bottom': '1px solid #eaecef',
    'font-size': '1.5em',
};
darkMDFormatterTheme.rules[MdCss.header3] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '1.25em',
};
darkMDFormatterTheme.rules[MdCss.header4] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '1em',
};
darkMDFormatterTheme.rules[MdCss.header5] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '.875em',
};
darkMDFormatterTheme.rules[MdCss.header6] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '.85em',
};
darkMDFormatterTheme.rules[MdCss.italics] = {
    'font-style': 'italic',
};
darkMDFormatterTheme.rules[MdCss.bold] = {
    'font-weight': 'bold',
};
darkMDFormatterTheme.rules[MdCss.strikethrough] = {
    'text-decoration': 'line-through',
};
darkMDFormatterTheme.rules[MdCss.orderedList] = {
    'list-style-type': 'decimal',
};
darkMDFormatterTheme.rules[MdCss.unorderedList] = {
    'list-style-type': 'circle',
};
darkMDFormatterTheme.rules[MdCss.link] = {
    'text-decoration': 'none',
    'color': 'rgb(77, 172, 253)',
};
darkMDFormatterTheme.rules[MdCss.image] = {
    'max-width': '100%',
};
darkMDFormatterTheme.rules[MdCss.inlineCode] = {
    'font-family': 'monospace',
    'padding': '.2em .4em',
    'font-size': '85%',
    'border-radius': '3px',
    'background-color': 'rgba(220, 224, 228, 0.1) !important',
};
darkMDFormatterTheme.rules[MdCss.blockCode] = {
    'font-family': 'monospace',
    'border-radius': '3px',
    'word-wrap': 'normal',
    'padding': '16px',
    'background': 'rgba(220, 224, 228, 0.1) !important',
};
darkMDFormatterTheme.rules[MdCss.tableHeader] = {
    'line-height': '1.5',
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'text-align': 'center',
    'font-weight': 'bold',
    'padding': '6px 13px',
    'border': '1px solid #dfe2e5',
};
darkMDFormatterTheme.rules[MdCss.tableCell] = {
    'line-height': '1.5',
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'text-align': 'right',
    'padding': '6px 13px',
    'border': '1px solid #dfe2e5',
};
darkMDFormatterTheme.rules[MdCss.quote] = {
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'padding': '6px 13px',
    'border-left': '.25em solid rgb(53, 59, 66)',
};
darkMDFormatterTheme.rules[MdCss.horizontalLine] = {
    'line-height': '1.5',
    'overflow': 'hidden',
    'height': '.25em',
    'padding': '0',
    'margin': '24px 0',
    'background': 'white',
};
const darkScrollbar = {
    '-webkit-scrollbar': {
        width: '10px',
    },
    '-webkit-scrollbar-track': {
        'background': 'rgb(53, 59, 66)',
        'border-radius': '4px',
    },
    '-webkit-scrollbar-thumb': {
        'background': 'rgb(83, 79, 86)',
        'border-radius': '4px',
    },
    '-webkit-scrollbar-thumb:hover': {
        background: 'rgb(93, 99, 106)',
    },
};
const darkEditorTheme = {
    'background': '#202225',
    'color': '#dcddde',
    'height': '50%',
    'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
};
const customTheme = {
    scrollbarTheme: darkScrollbar,
    additionalCssRules: darkMDFormatterTheme,
    editorTheme: darkEditorTheme,
};
