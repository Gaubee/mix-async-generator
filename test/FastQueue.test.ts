import { FastQuene } from "../src/FastQuene";
import test from "ava";
test("push/shift/remove", (t) => {
  const quene = new FastQuene<number>();
  /// push
  t.is(quene.size, 0);
  t.is(quene.push(1), 1);
  t.is(quene.size, 1);
  t.is(quene.push(2), 2);
  t.is(quene.size, 2);
  t.is(quene.push(1), 1);
  t.is(quene.size, 3);
  /// shift
  t.is(quene.shift(), 1);
  /// remove
  t.is(quene.size, 2);
  t.is(quene.remove(1), true);
  t.is(quene.size, 1);
  t.is(quene.remove(1), false);
  t.is(quene.size, 1);
  t.is(quene.remove(2), true);
  t.is(quene.size, 0);
  /// shift empty
  t.is(quene.shift(), undefined);
  t.is(quene.size, 0);
  /// push again
  t.is(quene.push(1), 1);
  t.is(quene.size, 1);
  t.is(quene.push(2), 2);
  t.is(quene.size, 2);
  t.is(quene.push(3), 3);
  t.is(quene.size, 3);
  t.is(quene.push(4), 4);
  t.is(quene.size, 4);
  t.is(quene.push(5), 5);
  t.is(quene.size, 5);
  /// shift again
  t.is(quene.remove(2), true);
  t.is(quene.size, 4);
  t.is(quene.remove(4), true);
  t.is(quene.size, 3);
});
