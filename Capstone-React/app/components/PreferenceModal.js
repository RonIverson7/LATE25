import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView,} from 'react-native';

const PREFERENCE_SLUG_MAP = {
  classical: 'classicalArt',
  contemporary: 'contemporary',
  impressionist: 'impressionist',
  abstract: 'abstractArt',
  sculpture: 'sculpture',
  photography: 'photography',
  digital: 'digitalArt',
  street: 'streetArt',
  minimalist: 'minimalist',
  surrealist: 'surrealist',
  landscape: 'landscape',
  portrait: 'portrait',
  miniature: 'miniature',
  expressionist: 'expressionist',
  realism: 'realism',
  conceptual: 'conceptual',
};

const SLUG_TO_FRONTEND_KEY = Object.entries(PREFERENCE_SLUG_MAP).reduce((acc, [front, back]) => {
  acc[back] = front;
  return acc;
}, {});

export default function PreferenceModal({
  interestsModalVisible,
  setInterestsModalVisible,
  selectedInterests,
  setSelectedInterests,
  accessToken,
  refreshToken,
  setHasArtPreferences,
  API_BASE,
  styles,
}) {
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    let abort = false;
    const loadCategories = async () => {
      try {
        if (!API_BASE || !accessToken || !refreshToken) return;

        const query = new URLSearchParams();
        query.append('page', '1');
        query.append('limit', '200');
        query.append('nocache', '1');

        const res = await fetch(`${API_BASE}/gallery/categories?${query.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `access_token=${accessToken}; refresh_token=${refreshToken}`,
          },
          credentials: 'include',
        });

        if (!res.ok) return;

        const catData = await res.json();
        const catList = Array.isArray(catData?.categories) ? catData.categories : [];
        if (abort) return;

        const palette = [
          '#111',
          '#6b21a8',
          '#b45309',
          '#047857',
          '#1f2937',
          '#0ea5e9',
          '#7c3aed',
          '#f59e0b',
          '#4b5563',
          '#ef4444',
          '#10b981',
          '#60a5fa',
          '#f59e0b',
          '#ef4444',
          '#10b981',
          '#0ea5e9',
        ];

        const mapped = catList.map((c, index) => {
          const backendSlug = c.slug || '';
          const frontId = SLUG_TO_FRONTEND_KEY[backendSlug] || backendSlug || (c.name || String(index));
          const color = palette[index % palette.length];
          return {
            id: frontId,
            name: c.name || backendSlug || 'Category',
            color,
          };
        });

        setCategories(mapped);
      } catch (e) {
        console.log('PreferenceModal loadCategories error:', e?.message || e);
      }
    };

    loadCategories();

    return () => {
      abort = true;
    };
  }, [API_BASE, accessToken, refreshToken]);

  return (
    <Modal visible={interestsModalVisible} animationType="fade" transparent>
      <TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={styles.interestsBox}>
            <Text style={styles.modalTitle}>Choose Your Art Interests</Text>
            <Text style={{ marginBottom: 10, color: '#555', textAlign: 'center' }}>
              Pick a few to personalize your feed
            </Text>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <View style={styles.interestsGrid}>
                {categories.map((cat) => {
                  const selected = selectedInterests.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedInterests((prev) =>
                          prev.includes(cat.id)
                            ? prev.filter((x) => x !== cat.id)
                            : [...prev, cat.id]
                        );
                      }}
                      style={[styles.categoryCard, selected && { borderColor: cat.color, backgroundColor: '#f9fafb' }]}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.categoryText, selected && { color: cat.color }]} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {!!selectedInterests.length && (
                <Text style={{ marginTop: 6, marginBottom: 10, color: '#111', fontWeight: '600', textAlign: 'center' }}>
                  {selectedInterests.length} selected
                </Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 10 }}>
              <TouchableOpacity
                style={[styles.cancelButton, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
                onPress={() => setInterestsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Maybe later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, backgroundColor: '#A68C7B', opacity: selectedInterests.length ? 1 : 0.5, alignItems: 'center', justifyContent: 'center' }]}
                disabled={!selectedInterests.length}
                onPress={async () => {
                  if (!selectedInterests.length) {
                    return;
                  }
                  try {
                    // Load gallery categories to resolve real categoryIds from selected slugs
                    const catRes = await fetch(`${API_BASE}/gallery/categories?page=1&limit=50&nocache=1`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `access_token=${accessToken}; refresh_token=${refreshToken}`,
                      },
                      credentials: 'include',
                    });
                    if (!catRes.ok) {
                      throw new Error(`Failed to load categories (${catRes.status})`);
                    }
                    const catData = await catRes.json();
                    const catList = Array.isArray(catData?.categories) ? catData.categories : [];

                    const categoryIds = selectedInterests
                      .map((slug) => {
                        const backendSlug = PREFERENCE_SLUG_MAP[slug] || slug;
                        const match = catList.find((c) => c.slug === backendSlug);
                        return match?.categoryId || match?.id || null;
                      })
                      .filter(Boolean);

                    if (!categoryIds.length) {
                      alert('Please wait for categories to load and try again.');
                      return;
                    }

                    const res = await fetch(`${API_BASE}/gallery/preferences`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `access_token=${accessToken}; refresh_token=${refreshToken}`,
                      },
                      credentials: 'include',
                      body: JSON.stringify({ categoryIds }),
                    });
                    if (!res.ok) {
                      let errMsg = `Failed to save preferences (${res.status})`;
                      try {
                        const txt = await res.text();
                        try {
                          const j = txt ? JSON.parse(txt) : null;
                          if (j && (j.message || j.error)) errMsg = `${errMsg}: ${j.message || j.error}`;
                          else if (txt) errMsg = `${errMsg}: ${txt}`;
                        } catch {
                          if (txt) errMsg = `${errMsg}: ${txt}`;
                        }
                      } catch {}
                      throw new Error(errMsg);
                    }
                    if (typeof setHasArtPreferences === 'function') {
                      setHasArtPreferences(true);
                    }
                    setInterestsModalVisible(false);
                  } catch (e) {
                    console.log('saveArtPreferences error:', e?.message || e);
                    alert(e?.message || 'Failed to save preferences');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
