import { ReactNode } from 'react';
import {
  render, act, cleanup, screen,
} from '@testing-library/react';
import {
  afterEach, beforeEach, describe, expect, test, vi,
} from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';

let mockUser: {
  isAdmin: boolean;
  determiningStatus: boolean;
  role: 'admin' | 'studyManager' | 'analyst' | null;
  studyIds: string[];
  user: { email: string } | null;
};
const mockVerifyUserAccess = vi.fn();
const mockLogout = vi.fn();
let mockStorageEngine: { getEngine: ReturnType<typeof vi.fn> } | undefined;

vi.mock('../store/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    verifyUserAccess: mockVerifyUserAccess,
    logout: mockLogout,
  }),
}));

vi.mock('../storage/storageEngineHooks', () => ({
  useStorageEngine: () => ({ storageEngine: mockStorageEngine }),
}));

let mockParams: Record<string, string> = {};

vi.mock('react-router', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid={`navigate-to-${to.slice(1)}`} />,
  useParams: () => mockParams,
}));

vi.mock('@mantine/core', () => ({
  LoadingOverlay: ({ visible }: { visible: boolean }) => (
    visible ? <div data-testid="loading-overlay" /> : null
  ),
  Alert: ({ title, children }: { title?: string; children: ReactNode }) => (
    <div>
      {title}
      {children}
    </div>
  ),
  Container: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@tabler/icons-react', () => ({
  IconInfoCircle: () => null,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUser = {
      isAdmin: false,
      determiningStatus: false,
      role: null,
      studyIds: [],
      user: { email: 'test@test.com' },
    };
    mockVerifyUserAccess.mockResolvedValue({ role: 'admin', studyIds: [] });
    mockLogout.mockReset();
    mockStorageEngine = { getEngine: vi.fn().mockReturnValue('localStorage') };
    mockParams = {};
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('shows loading overlay when user.determiningStatus is true', () => {
    mockUser = {
      ...mockUser,
      determiningStatus: true,
    };
    render(<ProtectedRoute><div>child</div></ProtectedRoute>);
    expect(screen.getByTestId('loading-overlay')).toBeDefined();
  });

  test('shows loading overlay when storageEngine is undefined', () => {
    mockStorageEngine = undefined;
    render(<ProtectedRoute><div>child</div></ProtectedRoute>);
    expect(screen.getByTestId('loading-overlay')).toBeDefined();
  });

  test('redirects to /login when the user is not authorized', async () => {
    mockVerifyUserAccess.mockResolvedValue(null);
    await act(async () => {
      render(<ProtectedRoute><div data-testid="child-content">child</div></ProtectedRoute>);
    });
    expect(screen.getByTestId('navigate-to-login')).toBeDefined();
  });

  test('renders children when the user is an admin', async () => {
    mockUser = {
      ...mockUser,
      isAdmin: true,
      role: 'admin',
    };
    mockVerifyUserAccess.mockResolvedValue({ role: 'admin', studyIds: [] });
    await act(async () => {
      render(<ProtectedRoute><div data-testid="child-content">child</div></ProtectedRoute>);
    });
    expect(screen.getByTestId('child-content')).toBeDefined();
  });

  test('shows unauthorized when an analyst opens an admin route', async () => {
    mockUser = {
      ...mockUser,
      role: 'analyst',
      studyIds: ['demo-html'],
    };
    mockVerifyUserAccess.mockResolvedValue({ role: 'analyst', studyIds: ['demo-html'] });

    await act(async () => {
      render(<ProtectedRoute><div data-testid="child-content">child</div></ProtectedRoute>);
    });

    expect(screen.getByText(/Unauthorized Access/)).toBeDefined();
    expect(screen.queryByTestId('child-content')).toBeNull();
  });

  test('calls paramCallback with param value when paramToCheck matches', async () => {
    mockParams = { studyId: 'test-study' };
    mockUser = {
      ...mockUser,
      isAdmin: true,
      role: 'admin',
    };
    const mockParamCallback = vi.fn().mockResolvedValue(true);

    await act(async () => {
      render(
        <ProtectedRoute requireAccess="viewStudy" paramToCheck="studyId" paramCallback={mockParamCallback}>
          <div data-testid="child-content">child</div>
        </ProtectedRoute>,
      );
    });

    expect(mockParamCallback).toHaveBeenCalledWith('test-study');
  });
});
