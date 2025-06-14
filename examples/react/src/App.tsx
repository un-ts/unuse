import { unResolve, unSignal, useIntervalFn } from 'unuse-react';

export default function App(): React.JSX.Element {
  const signal = unSignal<string>('Hello, World!');

  const resolvedReactState: [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>,
  ] = unResolve(signal);

  const isReactState = () => resolvedReactState[0] === 'Hello, World!';

  console.log('Resolved React State:', resolvedReactState);

  const { isActive } = useIntervalFn(() => {
    console.log('Interval function executed', isActive);
  }, 1000);

  return (
    <div className="app">
      <h1>React App</h1>
      <p>This is a simple React application.</p>
      <p>React Value: {resolvedReactState[0]}</p>
      <p>Is a real React State: {isReactState() ? 'Yes' : 'No'}</p>
    </div>
  );
}
