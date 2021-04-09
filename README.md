# MIX-AsyncGenerator

## Install

```
npm i mix-async-generator
```

## How to use

### example 1

```ts
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
```

> output

```
1
2
3
4
```

### example 2

> use `bench:boolean` to join an dispensable task.

```ts
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
```

> output

```
important: 1
important: 2
dispensable: 1
dispensable: 2
dispensable: 3
important: 3
```

### example 3

> use `jumpGun:number>=1` to preload the specified amount.

```ts
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
```

> output

```
1 // preload 1 result. this is default
10 // preload 3 result. config by 'jumpGun'
2
11
12
13
3
14
15
16
4
17
18
19
```
