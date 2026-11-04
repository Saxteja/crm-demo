import { useStore, type ModuleKey } from '../store';

export function useModulePermissions(moduleKey: ModuleKey) {
  return useStore((state) => state.permissions[state.role][moduleKey]);
}
