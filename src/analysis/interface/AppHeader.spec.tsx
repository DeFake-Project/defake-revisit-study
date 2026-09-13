import { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  describe, expect, test, vi,
} from 'vitest';
import { AppHeader } from './AppHeader';

let mockedRole: 'admin' | 'studyManager' | 'analyst' | null = null;
let mockedPathname = '/';

vi.mock('@mantine/core', () => ({
  ActionIcon: ({ children, ...props }: { children: ReactNode }) => <button type="button" {...props}>{children}</button>,
  AppShell: { Header: ({ children }: { children: ReactNode }) => <header>{children}</header> },
  Button: ({ children, ...props }: { children: ReactNode }) => <button type="button" {...props}>{children}</button>,
  Flex: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Grid: Object.assign(
    ({ children }: { children: ReactNode }) => <div>{children}</div>,
    { Col: ({ children }: { children: ReactNode }) => <div>{children}</div> },
  ),
  Image: ({ alt }: { alt: string }) => <img alt={alt} />,
  Select: () => <div>select</div>,
  Space: () => <div />,
  Title: ({ children }: { children: ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@tabler/icons-react', () => ({
  IconListCheck: () => <span>list</span>,
  IconSettings: () => <span>settings-icon</span>,
}));

vi.mock('react-router', () => ({
  useLocation: () => ({ pathname: mockedPathname }),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
}));

vi.mock('../../store/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      role: mockedRole,
      determiningStatus: false,
      isAdmin: mockedRole === 'admin',
      studyIds: [],
      user: mockedRole ? { email: 'user@example.com', uid: '1' } : null,
    },
  }),
}));

describe('analysis AppHeader auth controls', () => {
  test('shows settings and sign-in when the user is signed out', () => {
    mockedRole = null;
    mockedPathname = '/';
    const html = renderToStaticMarkup(<AppHeader studyIds={['demo-html']} />);
    expect(html).toContain('settings-icon');
    expect(html).toContain('Sign in');
  });

  test('shows settings for admins and hides sign-in', () => {
    mockedRole = 'admin';
    mockedPathname = '/';
    const html = renderToStaticMarkup(<AppHeader studyIds={['demo-html']} />);
    expect(html).toContain('settings-icon');
    expect(html).not.toContain('Sign in');
  });

  test('hides settings for study managers', () => {
    mockedRole = 'studyManager';
    mockedPathname = '/';
    const html = renderToStaticMarkup(<AppHeader studyIds={['demo-html']} />);
    expect(html).not.toContain('settings-icon');
    expect(html).not.toContain('Sign in');
  });
});
