'use client';

import { useMe } from '@/shared/hooks/use-auth';
import {
  useAttendanceIntentState,
  useCreateAttendanceIntent,
  useDeleteAttendanceIntent,
} from '@/shared/hooks/use-events';
import { useRouter } from 'next/navigation';

interface AttendanceIntentButtonProps {
  eventId: string;
  initialCount: number;
  redirectPath: string;
}

export function AttendanceIntentButton({
  eventId,
  initialCount,
  redirectPath,
}: AttendanceIntentButtonProps) {
  const router = useRouter();
  const { data: meData } = useMe();
  const isLoggedIn = Boolean(meData?.user);

  const { data: attendanceState } = useAttendanceIntentState(eventId, isLoggedIn);
  const { mutate: createIntent, isPending: isCreating } = useCreateAttendanceIntent(eventId);
  const { mutate: deleteIntent, isPending: isDeleting } = useDeleteAttendanceIntent(eventId);

  const isPending = isCreating || isDeleting;
  const attendeeCount = attendanceState?.data.attendeeCount ?? initialCount;
  const hasIntent = attendanceState?.data.hasIntent ?? false;

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    if (hasIntent) {
      deleteIntent();
      return;
    }

    createIntent();
  }

  return (
    <div className="rounded-2xl border border-brand-200/70 bg-brand-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-700">Presença</p>
      <p className="mt-1 text-sm text-slate-700">
        {attendeeCount}{' '}
        {attendeeCount === 1 ? 'pessoa confirmou presença' : 'pessoas confirmaram presença'}
      </p>

      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={
          hasIntent
            ? 'btn-secondary mt-3 w-full justify-center'
            : 'btn-primary mt-3 w-full justify-center'
        }
      >
        {isPending
          ? 'Atualizando...'
          : hasIntent
            ? 'Presença confirmada'
            : isLoggedIn
              ? 'Vou ir com certeza'
              : 'Entrar para confirmar presença'}
      </button>
    </div>
  );
}
