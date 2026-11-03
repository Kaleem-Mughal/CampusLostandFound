
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Category = 'Lost' | 'Found';

type Item = {
  id: string;
  title: string;
  description: string;
  category: Category;
};

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

  // Load saved data
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((data) => {
        if (data) setItems(JSON.parse(data));
      })
      .catch((error) => {
        console.error('Failed to load items:', error);
      })
      .finally(() => setLoaded(true));
  }, []);

  // Save data locally
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(KEY, JSON.stringify(items))
        .catch((error) => {
          console.error('Failed to save items:', error);
        });
    }
  }, [items, loaded]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Lost');
    setEditingId(null);
  };

  // CREATE + UPDATE
  const save = () => {
    if (!title.trim()) {
      return Alert.alert('Title is required');
    }

    if (editingId) {
      setItems((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? { ...item, title, description, category }
            : item
        )
      );
    } else {
      setItems((previous) => [
        {
          id: Date.now().toString(),
          title,
          description,
          category,
        },
        ...previous,
      ]);
    }

    resetForm();
  };

  // EDIT
  const startEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setEditingId(id);
  };

  // DELETE
  const remove = (id: string) => {
    setItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // SEARCH + FILTER
  const q = search.toLowerCase();

  const visible = items.filter(
    (item) =>
      (filter === 'All' || item.category === filter) &&
      [item.title, item.description].some((field) =>
        field.toLowerCase().includes(q)
      )
  );

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.heading}>Lost & Found Items</Text>

      <TextInput
        style={s.input}
        placeholder="Title"
        placeholderTextColor="#777777"
        selectionColor="#2563eb"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={s.input}
        placeholder="Description"
        placeholderTextColor="#777777"
        selectionColor="#2563eb"
        value={description}
        onChangeText={setDescription}
      />

      <View style={s.row}>
        {(['Lost', 'Found'] as Category[]).map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[
              s.chip,
              category === c && s.chipActive,
            ]}
          >
            <Text
              style={[
                s.chipText,
                category === c && s.chipTextActive,
              ]}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={s.button} onPress={save}>
        <Text style={s.buttonText}>
          {editingId ? 'Update Item' : 'Add Item'}
        </Text>
      </Pressable>

      <TextInput
        style={s.input}
        placeholder="Search..."
        placeholderTextColor="#777777"
        selectionColor="#2563eb"
        value={search}
        onChangeText={setSearch}
      />

      <View style={s.row}>
        {(['All', 'Lost', 'Found'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              s.chip,
              filter === f && s.chipActive,
            ]}
          >
            <Text
              style={[
                s.chipText,
                filter === f && s.chipTextActive,
              ]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={s.emptyText}>
            No items found
          </Text>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardContent}>
              <Text style={s.cardTitle}>
                {item.title} ({item.category})
              </Text>

              <Text style={s.description}>
                {item.description}
              </Text>
            </View>

            <Pressable onPress={() => startEdit(item.id)}>
              <Text style={s.edit}>Edit</Text>
            </Pressable>

            <Pressable onPress={() => remove(item.id)}>
              <Text style={s.del}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },

  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#888888',
    backgroundColor: '#F3F4F6',
  },

  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  chipText: {
    color: '#111827',
  },

  chipTextActive: {
    color: '#FFFFFF',
  },

  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontWeight: 'bold',
    color: '#111827',
  },

  description: {
    color: '#374151',
  },

  emptyText: {
    color: '#374151',
    textAlign: 'center',
    marginTop: 20,
  },

  edit: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },

  del: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});
