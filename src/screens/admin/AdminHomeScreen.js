import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Users, Package, Clock, CreditCard, Flag, ChevronRight } from 'lucide-react-native';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import adminService from '../../services/adminService';

export default function AdminHomeScreen({ navigation }) {
  const [state, setState] = useState({ data: null, status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    adminService
      .getDashboardStats()
      .then((data) => setState({ data, status: 'succeeded', error: null }))
      .catch((err) => setState({ data: null, status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  if (state.status === 'loading') return <Loader />;
  if (state.status === 'failed') return <ErrorMessage message={state.error} onRetry={load} />;

  const stats = state.data || {};

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Total Ads', value: stats.totalProducts, icon: Package },
    { label: 'Pending Review', value: stats.pendingProducts, icon: Clock },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard },
    { label: 'Pending Reports', value: stats.pendingReports, icon: Flag },
  ];

  const menuItems = [
    { label: 'Pending Ads', subtitle: 'Approve or reject new listings', screen: 'AdminPendingAds' },
    { label: 'Payments', subtitle: 'Verify posting-fee payments', screen: 'AdminPayments' },
    { label: 'Users', subtitle: 'Ban/unban, manage accounts', screen: 'AdminUsers' },
    { label: 'Reports', subtitle: 'Resolve reported listings', screen: 'AdminReports' },
  ];

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Admin Dashboard</Text>

      <View style={styles.statsGrid}>
        {statCards.map(({ label, value, icon: Icon }) => (
          <View key={label} style={styles.statCard}>
            <Icon size={18} color="#0f766e" />
            <Text style={styles.statValue}>{value ?? '-'}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Manage</Text>
      {menuItems.map((item) => (
        <TouchableOpacity key={item.screen} style={styles.menuRow} onPress={() => navigation.navigate(item.screen)}>
          <View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <ChevronRight size={18} color="#a3a3a3" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fafafa' },
  container: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#171717', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 12,
    gap: 6,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#171717' },
  statLabel: { fontSize: 10, color: '#737373' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#171717', marginBottom: 10 },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#171717' },
  menuSubtitle: { fontSize: 11, color: '#a3a3a3', marginTop: 2 },
});
