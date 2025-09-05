import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  create: () => ({
    post: jest.fn(() => Promise.resolve({ status: 200, data: { token: 't' } })),
    get: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  }),
}));

test('renders app title', () => {
  render(<App />);
  // Specifically target the header title (h1)
  const title = screen.getByRole('heading', { name: /Apna Video Call/i, level: 1 });
  expect(title).toBeInTheDocument();
});
