const fs = require("fs");

const file = fs
  .readFileSync("./text.txt")
  .toString()
  .split("\n")
  .filter(Boolean)
  .filter((item) => item !== "\r");

let createElement = (type, text) => `<${type}>${text}</${type}>`;
let createElementWithDataAttribute = ({ type, data }, text) => {
  if (data.selfClosing) {
    if (type === "img")
      return `<${type} ${data.attr}="${data.value}" alt="${text}" />`;
  }
  return `<${type} ${data.attr}="${data.value}">${text}</${type}>`;
};
function textToMarkDown(input) {
  let parsed = input.map((item) => {
    let [firstChar, restChars] = defineText(item);
    return Switchy(firstChar, restChars);
  });
  return parsed;
}
let specialChars = {
  "*": "*",
  "**": "**",
  "~~": "~~",
};
function testFindSpecialChars({ type }, text) {
  let isSpecialChars = false;
  let startIndex;
  let innerHtml;
  let items = text.split("");
  for (let i = 0; i < items.length; i += 1) {
    // TODO instead lets just find all elements and add their indexes to an array
    // TODO then iterate over that array, find spot in string, cut it add the new element
    // TODO do this until we finish
    // items.map(createArrayOfIndexes) --> array.map(addInnerHtmlChildren)
    if (specialChars[items[i]]) {
      let vals = parseP();
      i = vals[0];
      startIndex = vals[1];
      innerHtml = vals[2];
    }
  }
  createElement(type, innerHtml);
}
function findSpecialChars({ type }, text) {
  let isSpecialChars = false;
  if (type === "p") {
    let items = text.split("");

    items.map((item) => {
      if (item === "*") {
        isSpecialChars = true;
      }
    });

    if (isSpecialChars) {
      return createHTML({ type: "p", data: { emphasis: true } }, text);
    }
    return createHTML({ type: "p", data: { emphasis: false } }, text);
  }
}
function Switchy(symbol, rest) {
  switch (symbol) {
    case "#":
      return findRecuringChar(symbol, rest);
    case "p":
      return findSpecialChars({ type: "p" }, rest);
    case "-":
    case "*":
    case "+":
      return createHTML({ type: "nested", element: "ul" }, rest);
    case "[":
      let aTagText = cleanTextBasic(findSymbol("]", rest));
      let parensIndex = rest.indexOf("(");
      let url = cleanTextBasic(findSymbol(")", rest, parensIndex));
      return createHTML(
        { type: "a", data: { attr: "href", value: url } },
        aTagText
      );
    case "!":
      let altText = cleanTextBasic(findSymbol("]", rest, 1));

      let sourceParensIndex = rest.indexOf("(");
      let src = cleanTextBasic(findSymbol(")", rest, sourceParensIndex));

      return createHTML(
        { type: "img", data: { attr: "src", value: src, selfClosing: true } },
        altText
      );
    case ">":
      return createHTML({ type: "nested", element: "blockquote" }, rest);
    default:
      return "";
  }
}
function findSymbol(type, text, startIndex = 0) {
  let endIndex = text.indexOf(type, startIndex + 1);
  return text.slice(startIndex, endIndex);
}
function cleanTextBasic(text) {
  return text.slice(1).trim();
}
function findRecuringChar(type, text) {
  switch (type) {
    case "#":
      return something(6, "#", text);
  }
}

function something(limit, type, text) {
  let testingText = text.slice(0, limit).split("");

  let key = 0;
  for (let i = 1; i < testingText.length; i += 1) {
    let char = testingText[i];
    if (type === char) key += 1;
    else {
      break;
    }
  }
  let el = elementHashMap[type][key];
  let newText = text.slice(key + 1).trim();

  return createHTML({ type: el }, newText);
}

const elementHashMap = {
  "#": { 0: "h1", 1: "h2", 2: "h3", 3: "h4", 4: "h5", 5: "h6" },
};
function defineText(inputString) {
  let firstChar = inputString[0].toLowerCase();
  let restChars = inputString;
  let alphaNumeric = isAlphaNumeric(firstChar);
  if (alphaNumeric) {
    firstChar = "p";
  }
  return [firstChar, restChars];
}

let htmlString = combineHTML(textToMarkDown(file));

writeHTMLToFile("index", htmlString);

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false;
    }
  }
  return true;
}
function combineHTML(inputArray) {
  let combinedHTML = inputArray.join("");
  return combinedHTML;
}

function createHTML({ type, element, data }, text) {
  if (type === "nested") {
    return createNestedHTML(element, text);
  }
  if (type === "a" || type === "img") {
    return createElementWithDataAttribute({ type, data }, text);
  }
  if (type === "p" && data.emphasis) {
    return createNestedHTML(type, text);
  }
  return createElement(type, text);
}

function createNestedHTML(element, text) {
  switch (element) {
    case "ul":
      let ul = createElement("ul", createElement("li", cleanTextBasic(text)));
      return ul;
    case "ol":
      let ol = createElement("ol", createElement("ol", cleanTextBasic(text)));
      return ol;
    case "blockquote":
      let blockquote = createElementWithDataAttribute(
        {
          type: "blockquote",
          data: {
            attr: "style",
            value: `padding: 0 1em; color: #6a737d; border-left: .25em solid #dfe2e5`,
          },
        },
        createElement("p", cleanTextBasic(text))
      );
      return blockquote;
    case "p":
      let startIndex = text.indexOf("*");
      let endIndex = text.indexOf("*", startIndex + 1);
      let emText = text.slice(startIndex + 1, endIndex);
      let child = createHTML({ type: "em" }, emText);
      return insertElementAtIndex(
        { type: "p", text },
        { child, startIndex, endIndex: endIndex + 1 }
      );
    default:
      return "";
  }
}
function writeHTMLToFile(name, input) {
  fs.writeFileSync(`${name}.html`, input);
}

function insertElementAtIndex({ type, text }, { child, startIndex, endIndex }) {
  let start = text.slice(0, startIndex);
  let end = text.slice(endIndex);
  console.log(start);
  let innerHtml = `${start} ${child} ${end}`;
  return createElement(type, innerHtml);
}
function parseP(text, symbol, startIndex) {
  // stuff
  let endIndex;
  let createdElement = createdElement("em", text).length;
  let updatedIndex = createElement.length;
  let index;
  return [updatedIndex, startIndex];
}

function spliceIt(array) {
  let startIndex = array.indexOf("*");
  let endIndex = array.indexOf("*", startIndex + 1);
  let emText = array.slice(startIndex + 1, endIndex);
  let child = createHTML({ type: "em" }, emText);
  let childLength = child.length;
  let startArray = `${array.slice(0, startIndex)} ${child} ${array.slice(
    endIndex
  )}`;
  return startArray;
}
