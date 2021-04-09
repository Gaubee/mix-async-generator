// @ts-check
const { MixAsyncGenerator } = require("../build/src/");
const { sleep } = require("@bfchain/util-extends-promise");

(async function example() {
  const mixAG = new MixAsyncGenerator();
  mixAG.join(
    (async function* important() {
      yield `important: 1`;
      yield `important: 2`;
      await sleep(100);
      yield `important: 3`;
    })()
  );
  mixAG.join(
    (async function* dispensable() {
      yield `dispensable: 1`;
      yield `dispensable: 2`;
      yield `dispensable: 3`;
    })(),
    {
      bench: true,
    }
  );

  for await (const str of mixAG.toAsyncIterator()) {
    console.log(str);
  }
})();
