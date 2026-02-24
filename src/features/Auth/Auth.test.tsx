import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/tests/testUtils';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('email field is required', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it('has a link to register page', () => {
    render(<LoginForm />);
    const link = screen.getByRole('link', { name: /regístrate/i });
    expect(link).toHaveAttribute('href', '/register');
  });
});

describe('RegisterForm', () => {
  it('renders all registration fields', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'different');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
  });

  it('has a link to login page', () => {
    render(<RegisterForm />);
    const link = screen.getByRole('link', { name: /inicia sesión/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
