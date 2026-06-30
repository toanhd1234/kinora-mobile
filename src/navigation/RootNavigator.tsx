import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { navigationRef } from './navigationRef';
import { Loading } from '../components';
import { useTheme } from '../theme/ThemeProvider';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecipientsScreen from '../screens/RecipientsScreen';
import AddRecipientScreen from '../screens/AddRecipientScreen';
import RecipientHomeScreen from '../screens/RecipientHomeScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import TeamScreen from '../screens/TeamScreen';
import InvitationsScreen from '../screens/InvitationsScreen';
import ExplainScreen from '../screens/ExplainScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import InteractionsScreen from '../screens/InteractionsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';

type RecipientParams = { recipientId: number; recipientName: string };

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Recipients: undefined;
  AddRecipient: undefined;
  RecipientHome: RecipientParams;
  Medications: RecipientParams;
  AddMedication: RecipientParams;
  Team: RecipientParams;
  Invitations: undefined;
  Explain: RecipientParams;
  Appointments: RecipientParams;
  AppointmentDetail: { appointmentId: number };
  Documents: RecipientParams;
  Interactions: RecipientParams;
  Paywall: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  const navTheme: NavTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme : DefaultTheme).colors,
      primary: theme.colors.primary,
      background: theme.colors.bg,
      card: theme.colors.bg,
      text: theme.colors.text,
      border: theme.colors.hairline,
      notification: theme.colors.accent,
    },
  };

  if (loading) {
    return <Loading label="Loading Kinora…" />;
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.bg },
          headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.bg },
          headerBackTitleVisible: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Recipients"
              component={RecipientsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddRecipient"
              component={AddRecipientScreen}
              options={{ title: 'Add family member' }}
            />
            <Stack.Screen
              name="RecipientHome"
              component={RecipientHomeScreen}
              options={({ route }) => ({ title: route.params.recipientName })}
            />
            <Stack.Screen
              name="Medications"
              component={MedicationsScreen}
              options={{ title: 'Medications' }}
            />
            <Stack.Screen
              name="AddMedication"
              component={AddMedicationScreen}
              options={{ title: 'New medication' }}
            />
            <Stack.Screen
              name="Team"
              component={TeamScreen}
              options={{ title: 'Care team' }}
            />
            <Stack.Screen
              name="Invitations"
              component={InvitationsScreen}
              options={{ title: 'Invitations' }}
            />
            <Stack.Screen
              name="Explain"
              component={ExplainScreen}
              options={{ title: 'Explain for me' }}
            />
            <Stack.Screen
              name="Appointments"
              component={AppointmentsScreen}
              options={{ title: 'Appointments' }}
            />
            <Stack.Screen
              name="AppointmentDetail"
              component={AppointmentDetailScreen}
              options={{ title: 'Appointment' }}
            />
            <Stack.Screen
              name="Documents"
              component={DocumentsScreen}
              options={{ title: 'Documents' }}
            />
            <Stack.Screen
              name="Interactions"
              component={InteractionsScreen}
              options={{ title: 'Interaction check' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ title: 'Premium' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
