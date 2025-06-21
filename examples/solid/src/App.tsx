import type { JSX, Signal } from 'solid-js';
import { unResolve, unSignal, useIntervalFn } from 'unuse';

export default function App(): JSX.Element {
  const signal = unSignal<string>('Hello, World!');

  const resolvedSolidSignal: Signal<string> = unResolve(signal);

  const isSolidSignal = () => typeof resolvedSolidSignal[0] === 'function';

  console.log('Resolved Solid Signal:', resolvedSolidSignal);

  const { isActive } = useIntervalFn(() => {
    console.log('Interval function executed', isActive);
  }, 1000);

  return (
    <div class="app">
      <h1>Solid App</h1>
      <p>This is a simple Solid application.</p>
      <p>Signal Value: {resolvedSolidSignal[0]()}</p>
      <p>Is a real Solid Signal: {isSolidSignal() ? 'Yes' : 'No'}</p>
    </div>
  );
}
