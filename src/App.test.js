import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login portal on startup when unauthenticated', () => {
  render(<App />);
  const portalHeader = screen.getByText(/Admin Management Portal/i);
  expect(portalHeader).toBeInTheDocument();
  
  const submitButton = screen.getByRole('button', { name: /Sign In to Admin Portal/i });
  expect(submitButton).toBeInTheDocument();
});
