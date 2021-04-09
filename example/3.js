// @ts-check
const { MixAsyncGenerator } = require("../build/src/");

(async function example() {
  const mixAG = new MixAsyncGenerator();

  async function* yieldNum(start = 0, end = start + 1) {
    while (start <= end) {
      yield start++;
    }
  }
  mixAG.join(yieldNum(1, 4));
  mixAG.join(yieldNum(10, 19), {
    jumpGun: 3,
  });

  for await (const str of mixAG.toAsyncIterator()) {
    console.log(str);
  }
})();
