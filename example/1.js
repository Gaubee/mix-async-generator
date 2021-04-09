// @ts-check
const { MixAsyncGenerator } = require("../build/src/");
(async function example() {
  const mixAG = new MixAsyncGenerator();
  mixAG.join(
    (async function* someAg1() {
      yield 1;
      yield 3;
    })()
  );
  mixAG.join(
    (async function* someAg2() {
      yield 2;
      yield 4;
    })()
  );

  for await (const num of mixAG.toAsyncIterator()) {
    console.log(num);
  }
})();
