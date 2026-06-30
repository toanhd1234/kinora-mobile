import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Navigate from outside React (e.g. an axios interceptor). No-op until ready. */
export function navigateFromOutside(name: keyof RootStackParamList) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never);
  }
}
