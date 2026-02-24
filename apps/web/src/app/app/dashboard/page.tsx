'use client';

import { resolveRoleHomeRedirect } from '@/app/login/login-redirect';
import { useMe } from '@/shared/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || !data?.user) return;
    router.replace(resolveRoleHomeRedirect(data.user.role));
  }, [data, isLoading, router]);

  return <p>Redirecionando...</p>;
}
