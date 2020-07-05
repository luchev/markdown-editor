import { Formatter } from './Formatter';
import { DOMHelper } from './DOMHelper';
import { Compiler } from './Compiler';
export class MdFormatter extends Formatter {
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
