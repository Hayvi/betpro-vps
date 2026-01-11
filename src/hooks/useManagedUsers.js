import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchManagedUsers } from '@/services/rbacAdminService';
import { onWsMessage } from '@/services/wsClient';

export function useManagedUsers() {
  const { userId } = useAuth();
  const [managedUsers, setManagedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const refreshManagedUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { users, error } = await fetchManagedUsers();
    if (!error) setManagedUsers(users || []);
    setLoadingUsers(false);
  }, []);

  useEffect(() => {
    refreshManagedUsers();
  }, [refreshManagedUsers]);

  useEffect(() => {
    if (!userId) return;

    const unsub1 = onWsMessage('users_update', () => {
      refreshManagedUsers();
    });
    
    const unsub2 = onWsMessage('withdrawal_approved', () => {
      refreshManagedUsers();
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId, refreshManagedUsers]);

  return {
    managedUsers,
    loadingUsers,
    refreshManagedUsers,
  };
}
