import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '../app/utils/authUtils';

interface Props {
  children: React.ReactNode;
  fallbackRoute?: string;
}

const AuthGuard: React.FC<Props> = ({ children, fallbackRoute = "/login" }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsAuth(authenticated);
        
        if (!authenticated) {
          router.replace(fallbackRoute);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.replace(fallbackRoute);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, fallbackRoute]);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  if (!isAuth) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
};

export default AuthGuard;