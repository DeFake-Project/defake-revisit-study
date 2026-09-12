import {
  createContext, useContext, useMemo, ReactNode,
  useEffect, useState,
  useCallback,
} from 'react';
import { LoadingOverlay } from '@mantine/core';
import { useLocation, useMatch } from 'react-router';
import { useStorageEngine } from '../../storage/storageEngineHooks';
import { AuthorizedUserAccess, StoredUser, UserWrapped } from '../../storage/engines/types';
import { isCloudStorageEngine } from '../../storage/engines/utils/storageEngineHelpers';
import { SupabaseStorageEngine } from '../../storage/engines/SupabaseStorageEngine';

function withPermissions(user: Omit<UserWrapped, 'isAdmin' | 'role' | 'studyIds'> & Partial<Pick<UserWrapped, 'isAdmin' | 'role' | 'studyIds'>>): UserWrapped {
  const role = user.role ?? null;
  return {
    user: user.user,
    determiningStatus: user.determiningStatus,
    adminVerification: user.adminVerification,
    role,
    studyIds: user.studyIds ?? [],
    isAdmin: role === 'admin',
  };
}

// Defines default AuthContextValue
interface AuthContextValue {
  user: UserWrapped;
  logout: () => Promise<void>;
  triggerAuth: () => void;
  verifyUserAccess: (inputUser: UserWrapped) => Promise<AuthorizedUserAccess | null>;
  }

// Initializes AuthContext
const AuthContext = createContext<AuthContextValue>({
  user: withPermissions({
    user: null,
    determiningStatus: false,
    adminVerification: false,
  }),
  logout: async () => {},
  triggerAuth: () => {},
  verifyUserAccess: () => Promise.resolve(null),
});

// Firebase auth context
export const useAuth = () => useContext(AuthContext);

// Defines the functions that are exposed in this hook.
export function AuthProvider({ children } : { children: ReactNode }) {
  // Default non-user when loading
  const loadingNullUser : UserWrapped = withPermissions({
    user: null,
    determiningStatus: true,
    adminVerification: false,
  });

  // Default non-user when not loading
  const nonLoadingNullUser : UserWrapped = withPermissions({
    user: null,
    determiningStatus: false,
    adminVerification: false,
  });

  // Non-auth User
  const nonAuthUser : UserWrapped = withPermissions({
    user: {
      email: 'fakeEmail@fake.com',
      uid: 'fakeUid',
      role: 'admin',
    },
    determiningStatus: false,
    adminVerification: true,
    role: 'admin',
  });

  const [user, setUser] = useState(loadingNullUser);
  const [enableAuthTrigger, setEnableAuthTrigger] = useState(false);
  const { storageEngine } = useStorageEngine();
  const location = useLocation();
  const studyRouteMatch = useMatch('/:studyId/*');

  // Logs the user out by removing the user and navigating to '/login'
  const logout = async () => {
    if (storageEngine && isCloudStorageEngine(storageEngine)) {
      try {
        await storageEngine.logout();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(`There was an issue signing-out the user: ${error.message}`);
      } finally {
        setUser(nonLoadingNullUser);
      }
    }
  };

  const triggerAuth = useCallback(() => {
    setEnableAuthTrigger(true);
  }, []);

  // This useEffect checks for an existing Supabase session on mount since it requires a redirect to login
  useEffect(() => {
    const checkSession = async () => {
      if (storageEngine?.getEngine() === 'supabase') {
        try {
          await (storageEngine as SupabaseStorageEngine).getSession();
        } catch (err) {
          // optional: log or handle errors
          console.error('Supabase session check failed', err);
        }
      }
    };
    checkSession();
  }, [storageEngine, triggerAuth]);

  const verifyUserAccess = useCallback(async (inputUser: UserWrapped) => {
    if (storageEngine && isCloudStorageEngine(storageEngine)) {
      return storageEngine.validateUser(inputUser, true);
    }
    if (inputUser.role) {
      return { role: inputUser.role, studyIds: inputUser.studyIds };
    }
    return null;
  }, [storageEngine]);

  useEffect(() => {
    // Set initialUser
    setUser(loadingNullUser);

    // Handle auth state changes for Firebase
    const handleAuthStateChanged = async (cloudUser: StoredUser | null) => {
      // Reset the user. This also gets called on signOut
      setUser((prevUser) => withPermissions({
        user: prevUser.user,
        determiningStatus: true,
        adminVerification: false,
        role: prevUser.role,
        studyIds: prevUser.studyIds,
      }));
      if (cloudUser) {
        // Reach out to firebase to validate user
        const currUser: UserWrapped = withPermissions({
          user: cloudUser,
          determiningStatus: false,
          adminVerification: true,
        });
        const access = await verifyUserAccess(currUser);
        if (access) {
          currUser.role = access.role;
          currUser.studyIds = access.studyIds;
          currUser.isAdmin = access.role === 'admin';
          currUser.user = {
            ...cloudUser,
            role: access.role,
            studyIds: access.studyIds,
          };
        }
        setUser(currUser);
      } else {
        logout();
      }
    };

    // Determine authentication listener based on storageEngine and authEnabled variable
    const determineAuthentication = async () => {
      if (storageEngine && isCloudStorageEngine(storageEngine)) {
        const authInfo = await storageEngine.getUserManagementData('authentication');
        if (authInfo?.isEnabled) {
          storageEngine.unsubscribe(handleAuthStateChanged);
        } else {
          setUser(nonAuthUser);
        }
      } else if (storageEngine) {
        setUser(nonAuthUser);
      }
      return () => {};
    };

    const cleanupPromise = determineAuthentication();

    return () => {
      cleanupPromise.then((cleanup) => cleanup());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageEngine, enableAuthTrigger]);

  const value = useMemo(() => ({
    user,
    triggerAuth,
    logout,
    verifyUserAccess,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, verifyUserAccess]);

  const allowChildrenWhileDeterminingStatus = Boolean(studyRouteMatch) && !location.pathname.startsWith('/analysis');

  return (
    <AuthContext.Provider value={value}>
      {user.determiningStatus && !allowChildrenWhileDeterminingStatus ? <LoadingOverlay visible /> : children }
    </AuthContext.Provider>
  );
}
