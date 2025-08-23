import { useAuth as useMochaAuth } from '@getmocha/users-service/react';
import { useLocalAuth } from '@/react-app/contexts/LocalAuthContext';

export const useUnifiedAuth = () => {
  const mochaAuth = useMochaAuth();
  const localAuth = useLocalAuth();

  // Determine which auth system has an active user
  const getActiveAuth = () => {
    if (localAuth.user) {
      return {
        user: localAuth.user,
        authType: 'local' as const,
        isLoading: localAuth.isLoading,
        logout: localAuth.logout,
      };
    }

    if (mochaAuth.user) {
      return {
        user: {
          id: mochaAuth.user.id,
          email: mochaAuth.user.email,
          name: (mochaAuth.user as any).name || mochaAuth.user.email,
          authType: 'google' as const,
        },
        authType: 'google' as const,
        isLoading: mochaAuth.isPending,
        logout: mochaAuth.logout,
      };
    }

    return {
      user: null,
      authType: null,
      isLoading: localAuth.isLoading || mochaAuth.isPending,
      logout: () => {
        localAuth.logout();
        mochaAuth.logout();
      },
    };
  };

  const activeAuth = getActiveAuth();

  return {
    user: activeAuth.user,
    authType: activeAuth.authType,
    isLoading: activeAuth.isLoading,
    isAuthenticated: !!activeAuth.user,
    
    // Google OAuth methods
    redirectToLogin: mochaAuth.redirectToLogin,
    
    // Local auth methods
    localLogin: localAuth.login,
    localRegister: localAuth.register,
    
    // Unified logout
    logout: activeAuth.logout,
    
    // Check auth status
    checkAuth: localAuth.checkAuth,
    
    // Token for API calls (only available for local auth)
    token: localAuth.token,
  };
};