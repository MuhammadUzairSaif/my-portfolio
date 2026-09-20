import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the portfolio headline and certifications', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Muhammad Uzair Saif' })).toBeInTheDocument();
  expect(screen.getByText('Salesforce Certified Platform Developer II')).toBeInTheDocument();
});
