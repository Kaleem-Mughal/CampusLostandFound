import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Product = { id: number; title: string; price: number; category: string; thumbnail: string };

export default function ExploreScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('https://dummyjson.com/products?limit=10');
      setProducts(res.data.products);
    } catch (e) {
      setError('Failed to load data. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (error)
    return (
      <View style={s.center}>
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
        <Pressable onPress={fetchData}><Text style={{ color: '#2563eb' }}>Retry</Text></Pressable>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={s.heading}>Products (API)</Text>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id.toString()}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Image source={{ uri: item.thumbnail }} style={s.img} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.category}</Text>
              <Text>${item.price}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: { flexDirection: 'row', gap: 12, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  img: { width: 70, height: 70, borderRadius: 8 },
});