declare module 'react-native-html-parser' {
  export class DOMParser {
    parseFromString(source: string, mimeType: string): Document;
  }

  interface Document {
    documentElement: Element;
    getElementsByTagName(tagName: string): Element[];
    getElementsByClassName(className: string): Element[];
  }

  interface Element {
    textContent?: string;
    getAttribute(name: string): string | null;
    getElementsByTagName(tagName: string): Element[];
    getElementsByClassName(className: string): Element[];
  }
} 