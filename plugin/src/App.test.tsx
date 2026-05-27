import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders virtual try-on popup', () => {
  render(<App />);
  expect(screen.getByText(/Virtual Try-On/i)).toBeInTheDocument();
});
