import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Category = 'Lost' | 'Found';
type Item = { id: string; title: string; description: string; category: Category };
const KEY = 'items';

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Lost');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | Category>('All');

  // Load saved data once
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((d) => {
      if (d) setItems(JSON.parse(d));
      setLoaded(true);
    });
  }, []);

  // Save every time items change (after the first load)
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('Lost'); setEditingId(null);
  };

  const save = () => {
    if (!title.trim()) return Alert.alert('Title is required');
    if (editingId) {
      // UPDATE
      setItems(items.map((i) => (i.id === editingId ? { ...i, title, description, category } : i)));
    } else {
      // CREATE
      setItems([{ id: Date.now().toString(), title, description, category }, ...items]);
    }
    resetForm();
  };

  const startEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setTitle(item.title); setDescription(item.description);
    setCategory(item.category); setEditingId(id);
  };

  // DELETE
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  // SEARCH + FILTER
  const q = search.toLowerCase();
  const visible = items.filter(
    (i) =>
      (filter === 'All' || i.category === filter) &&
      [i.title, i.description].some((f) => f.toLowerCase().includes(q))
  );

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.heading}>Lost & Found Items</Text>

      <TextInput style={s.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={s.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <View style={s.row}>
        {(['Lost', 'Found'] as Category[]).map((c) => (
          <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.chipActive]}>
            <Text style={category === c && s.chipTextActive}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={s.button} onPress={save}>
        <Text style={s.buttonText}>{editingId ? 'Update Item' : 'Add Item'}</Text>
      </Pressable>

      <TextInput style={s.input} placeholder="Search..." value={search} onChangeText={setSearch} />
      <View style={s.row}>
        {(['All', 'Lost', 'Found'] as const).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[s.chip, filter === f && s.chipActive]}>
            <Text style={filter === f && s.chipTextActive}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No items found</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{item.title} ({item.category})</Text>
              <Text>{item.description}</Text>
            </View>
            <Pressable onPress={() => startEdit(item.id)}><Text style={s.edit}>Edit</Text></Pressable>
            <Pressable onPress={() => remove(item.id)}><Text style={s.del}>Delete</Text></Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#888' },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipTextActive: { color: '#fff' },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontWeight: 'bold' },
  edit: { color: '#2563eb' },
  del: { color: '#dc2626' },
});