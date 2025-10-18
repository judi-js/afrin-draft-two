'use client';

import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/kits/button';
import { startTransition, useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { Spinner } from '@/app/ui/kits/spinner';

export default function LoginForm({ id }: { id: string }) {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // ensure id is always included
    formData.set('id', id);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-6 pt-8 shadow">
        {/* Hidden ID field (comes from props) */}
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="redirectTo" value="/" />

        {/* Password input only */}
        <div className="mb-3">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="text-gray-700 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="mt-4 w-full flex items-center justify-center"
          disabled={isPending}
          aria-disabled={isPending}
        >
          {isPending ? (
            <>
              جارٍ تسجيل الدخول...
              <Spinner className="mr-auto h-5 w-5 text-gray-50" />
            </>
          ) : (
            <>
              تسجيل الدخول
              <ArrowLeftIcon className="mr-auto h-5 w-5 text-gray-50" />
            </>
          )}
        </Button>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 flex items-center text-red-600 text-sm">
            <ExclamationCircleIcon className="h-5 w-5 ml-1" />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}
