import { render, screen } from '@testing-library/react';
import App from './App';

test('renders tic tac toe title', () => {
  render(<App />);
  const header = screen.getByText(/Tic Tac Toe/i);
  expect(header).toBeInTheDocument();
});
