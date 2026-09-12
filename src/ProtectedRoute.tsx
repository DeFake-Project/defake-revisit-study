import { Alert, Container, LoadingOverlay } from '@mantine/core';
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAuth } from './store/hooks/useAuth';
import { useStorageEngine } from './storage/storageEngineHooks';
import { canManageUsers, canViewPrivateStudy } from './utils/userPermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAccess?: 'admin' | 'viewStudy';
  paramToCheck?: string;
  paramCallback?: (paramToCheck: string) => Promise<boolean>;
  resolveParam?: (paramToCheck: string) => string;
}

// Wrapper component which only allows authorized users to access its child components.
export function ProtectedRoute({
  children,
  requireAccess = 'admin',
  paramToCheck,
  paramCallback,
  resolveParam,
}: ProtectedRouteProps) {
  const { user, verifyUserAccess } = useAuth();
  const { storageEngine } = useStorageEngine();
  const params = useParams();
  const [access, setAccess] = useState<'loading' | 'allow' | 'login' | 'forbidden'>('loading');
  const rawStudyId = paramToCheck ? params[paramToCheck] : undefined;
  const resolvedStudyId = rawStudyId ? (resolveParam?.(rawStudyId) ?? rawStudyId) : undefined;
  const userEmail = user.user?.email;

  useEffect(() => {
    const verifyUser = async () => {
      if (user.determiningStatus || !storageEngine) {
        setAccess('loading');
        return;
      }

      if (requireAccess === 'viewStudy' && rawStudyId && paramCallback) {
        const shouldProtect = await paramCallback(rawStudyId);
        if (!shouldProtect) {
          setAccess('allow');
          return;
        }
      }

      const authorized = await verifyUserAccess(user);
      if (!authorized) {
        setAccess(user.role ? 'forbidden' : 'login');
        return;
      }

      if (requireAccess === 'admin') {
        setAccess(canManageUsers(authorized.role) ? 'allow' : 'forbidden');
        return;
      }

      setAccess(canViewPrivateStudy(authorized.role, authorized.studyIds, resolvedStudyId) ? 'allow' : 'forbidden');
    };

    verifyUser();
  }, [
    paramCallback,
    rawStudyId,
    requireAccess,
    resolvedStudyId,
    storageEngine,
    user,
    user.determiningStatus,
    user.role,
    userEmail,
    verifyUserAccess,
  ]);

  if (user.determiningStatus || !storageEngine || access === 'loading') {
    return <LoadingOverlay visible={user.determiningStatus || !storageEngine?.getEngine() || access === 'loading'} />;
  }

  if (access === 'login') {
    return <Navigate to="/login" />;
  }

  if (access === 'forbidden') {
    return (
      <Container mt={40} maw={640}>
        <Alert title="Unauthorized Access" color="red" icon={<IconInfoCircle />}>
          You are not authorized to view this page.
        </Alert>
      </Container>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
