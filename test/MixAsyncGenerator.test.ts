import { MixAsyncGenerator } from "../src/MixAsyncGenerator";
import { sleep } from "@bfchain/util-extends-promise";
import test from "ava";
async function* LoopAg(
  from = 1,
  to = 10,
  throwAt = to + 1,
  hooks?: {
    before?: (value: number) => unknown;
    after?: (value: number) => unknown;
  }
) {
  for (let i = from; i <= to; i++) {
    hooks?.before?.(i);
    await sleep(10);
    if (i === throwAt) {
      throw i;
    }
    yield i;
    hooks?.after?.(i);
  }
}
const reduceTotal = async (ag: AsyncGenerator<number>) => {
  let total = 0;
  for await (const item of ag) {
    total += item;
  }
  return total;
};
type AG = MixAsyncGenerator.AG<number>;

test("free loop", async (t) => {
  const m = new MixAsyncGenerator<AG>();
  const ag1 = m.join(LoopAg(1, 5));
  m.join(LoopAg(6, 7));
  m.join(LoopAg(8, 15));

  t.is(
    await reduceTotal(m.toAsyncIterator()),
    await reduceTotal(LoopAg(1, 15))
  );

  t.false(m.remove(ag1));
  t.deepEqual(await m.next(), { step: { done: true, value: undefined } });
});

test("bench loop", async (t) => {
  const m = new MixAsyncGenerator<AG>();
  m.join(LoopAg(1, 3), { bench: true });
  m.join(LoopAg(4, 5), { bench: true });
  m.join(LoopAg(6, 9), { bench: true });
  t.is(await reduceTotal(m.toAsyncIterator()), await reduceTotal(LoopAg(1, 9)));
});

test("throw", async (t) => {
  const m = new MixAsyncGenerator<AG>();
  const ag = m.join(LoopAg(1, 3, 2));
  const err1 = new Promise<MixAsyncGenerator.Error<AG>>((resolve) =>
    m.onError.attachOnce(resolve)
  );
  t.deepEqual(await m.next(), {
    from: ag,
    step: { done: false, value: 1 },
  });
  t.deepEqual(await m.next(), {
    step: { done: true, value: undefined },
  });
  t.deepEqual(await err1, { from: ag, reason: 2 });
});

test("jumpGun", async (t) => {
  const m = new MixAsyncGenerator<AG>();
  let count = 0;
  let current = 0;
  const ag = m.join(
    LoopAg(1, 4, 0, {
      // logTime && console.log(`wait 10ms from ${i}`);
      before(v) {
        current = v;
        count += 1;
      },
    }),
    {
      name: "jump-tester",
      jumpGun: 2,
    }
  );
  await sleep(100);
  t.is(ag.inQueueSteps, ag.jumpGun); // @FIXME: 这里不一定……
  t.is(ag.inQueueSteps, count);
  t.is(ag.currentStep?.value, 2);

  count = 0;
  {
    const time_start = Date.now();
    await m.next(); // 1
    await m.next(); // 2
    const time_end = Date.now();
    const time_diff = time_end - time_start;
    t.true(
      time_diff <= 1,
      `jumpGun's time ${time_start}~${time_end} ${time_diff}ms should less then 1ms`
    );
  }
  t.is(current, 3);
  {
    const t3 = m.next(); // 3
    const t4 = m.next(); // 4
    t.is(ag.currentStep?.value, 2);
    await t3;
    t.is(ag.currentStep?.value, 3);
    await t4;
    t.is(ag.currentStep?.value, 4);

    const ts = Date.now();
    await m.next(); // done
    const te = Date.now();
    const td = te - ts;
    t.true(td <= 1, `The Done taks ${ts}~${te} ${td}ms, should less then 1ms`);
    t.true(m.isDone, `${ag.name} shoule be finished`);
    t.is(ag.currentStep?.done, true);
  }
  t.is(current, 4);
});
test("lazy jumpGun", async (t) => {
  const m = new MixAsyncGenerator<AG>();

  const ag1 = m.join(LoopAg(1, 2), {
    name: "jump-tester",
    jumpGun: 1,
  });
  const ag2 = m.join(LoopAg(11, 13), {
    name: "jump-tester",
    bench: true,
    jumpGun: 2,
  });
  const ag3 = m.join(LoopAg(3, 4), {
    name: "jump-tester",
    jumpGun: 1,
  });
  await sleep(100);
  t.is(ag1.inQueueSteps, ag1.jumpGun);
  t.is(ag2.inQueueSteps, 0);
  t.is(ag3.inQueueSteps, ag1.jumpGun);

  t.is((await m.next()).step.value, 1);
  t.is((await m.next()).step.value, 3);
  t.is((await m.next()).step.value, 2);
  t.is((await m.next()).step.value, 4);

  t.is((await m.next()).step.value, 11);
  t.is((await m.next()).step.value, 12);
  t.is((await m.next()).step.value, 13);
});
