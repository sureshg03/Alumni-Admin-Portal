import { LexicalNode } from 'lexical';

export class ImageNode extends LexicalNode {
  constructor(src, alt) {
    super();
    this.__src = src;
    this.__alt = alt;
  }

  static getType() {
    return 'image';
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__alt);
  }

  createDOM() {
    const img = document.createElement('img');
    img.src = this.__src;
    img.alt = this.__alt;
    img.style.maxWidth = '100%';
    return img;
  }

  updateDOM(prevNode, dom) {
    if (prevNode.__src !== this.__src) {
      dom.src = this.__src;
    }
    if (prevNode.__alt !== this.__alt) {
      dom.alt = this.__alt;
    }
    return false;
  }

  exportJSON() {
    return {
      type: 'image',
      src: this.__src,
      alt: this.__alt,
    };
  }

  static importJSON(serializedNode) {
    return $createImageNode(serializedNode.src, serializedNode.alt);
  }
}

export function $createImageNode(src, alt) {
  return new ImageNode(src, alt);
}