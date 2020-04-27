let specialChars = {
  "*": "*",
  "**": "**",
  "~": "~~",
};
function spliceIt(input) {
  let string = input;
  let i = 0;
  while (i < string.length) {
    let symbol = specialChars[string[i]];
    console.log(symbol);
    if (symbol && i + 2 < string.length) {
      if (string[i + 1] === symbol) {
        symbol += symbol;
      }
      result = doIt(string, symbol, i);
      console.log(`index${i} length ${string.length}`);
      string = result[0];
      i += result[1];
      console.log(`index${i} length ${string.length}`);
      console.log(`string ${string}`);
      continue;
    }
    console.log(`string ${string}`);
    i += 1;
  }
  function doIt(array, symbol) {
    let startIndex = array.indexOf(symbol, i);
    let endIndex = array.indexOf(symbol, startIndex + symbol.length);
    if (symbol.length === 1 && array[endIndex + 1] === symbol) {
      console.log("true");
      return [array, 1];
    }
    if (endIndex === -1) {
      return array;
    }
    let emText = array.slice(startIndex + symbol.length, endIndex);
    let child = `<span>${emText}</span>`;
    let childLength = child.length;
    console.log(`child length ${childLength}`);
    // console.log(emText);
    let startArray = `${array.slice(0, startIndex)}${child}${array.slice(
      endIndex + symbol.length
    )}`;
    // console.log(startArray);
    return [startArray, childLength];
  }
  return string;
}

console.log(
  spliceIt("~~parag~~raph baby itali~cs~ hahaha so can this last longer")
);

// let teststring = "hi there *lol hey";
// let startIndex = teststring.indexOf("*");
// let endIndex = teststring.indexOf("*", startIndex + 1);
// console.log(endIndex);
