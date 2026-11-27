import { useMutation } from '@tanstack/react-query';

import { signOut } from '../signOut';

export function useLogout() {
  return useMutation({ mutationFn: signOut });
}
