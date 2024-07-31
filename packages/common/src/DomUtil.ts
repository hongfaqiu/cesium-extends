/**
 * @Author: Caven
 * @Date: 2021-04-27 13:04:34
 */

class DomUtil {
  /**
   * Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
   * @param tagName
   * @param className
   * @param container
   * @returns {HTMLElement}
   */
  static create(
    tagName: string,
    className: string,
    container: Element | null = null,
  ): HTMLElement {
    const el = document.createElement(tagName);
    el.className = className || "";
    if (container) {
      container.appendChild(el);
    }
    return el;
  }

  /**
   * Parses string to Dom
   * @param domStr
   * @param withWrapper
   * @param className
   * @returns {HTMLDivElement}
   */
  static parseDom(domStr: string, className: string): HTMLDivElement {
    const el = document.createElement("div");
    el.className = className || "";
    el.innerHTML = domStr;
    return el;
  }
}

export default DomUtil;
