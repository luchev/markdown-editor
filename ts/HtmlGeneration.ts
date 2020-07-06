/**
 * Convert html string to html element
 * @param {string} html string
 * @return {HTMLElement}
 */
export function htmlElementFromString(html: string): HTMLElement {
  const creationHelperElement = document.createElement('div');
  creationHelperElement.innerHTML = html.trim();
  if (
    creationHelperElement.firstChild &&
    creationHelperElement.firstChild.nodeType === Node.ELEMENT_NODE
  ) {
    return creationHelperElement.firstChild as HTMLElement;
  }
  throw new Error('Failed to create element from html: ' + html);
}
