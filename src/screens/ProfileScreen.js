import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Package, Heart, Bookmark, ShieldCheck, ChevronRight, LogOut } from 'lucide-react-native';
import useAuth from '../hooks/useAuth';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'My Ads', icon: Package, screen: 'MyAds' },
    { label: 'Favourites', icon: Heart, screen: 'Favourites' },
    { label: 'Saved Searches', icon: Bookmark, screen: 'SavedSearches' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ label: 'Admin Panel', icon: ShieldCheck, screen: 'AdminHome' });
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone ? <Text style={styles.meta}>📞 {user.phone}</Text> : null}
        {user?.location ? <Text style={styles.meta}>📍 {user.location}</Text> : null}
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.screen} style={styles.menuRow} onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.menuLeft}>
              <item.icon size={18} color="#0f766e" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <ChevronRight size={16} color="#a3a3a3" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut size={16} color="#dc2626" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fafafa' },
  container: { padding: 20, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 84, height: 84, borderRadius: 999, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 19, fontWeight: '700', color: '#171717' },
  email: { fontSize: 13, color: '#737373', marginBottom: 6 },
  meta: { fontSize: 12, color: '#525252' },
  menu: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden', marginBottom: 20 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#171717' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 12,
  },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
