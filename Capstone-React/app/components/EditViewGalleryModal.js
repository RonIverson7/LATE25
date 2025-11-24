import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditViewGalleryModal = ({
  visible,
  onClose,
  existingImages,
  newImages,
  onRemoveExistingImage,
  onRemoveNewImage,
  onPickNewImages,
  editTitle,
  onChangeTitle,
  editMedium,
  onChangeMedium,
  editDescription,
  onChangeDescription,
  categories,
  editCategories,
  onToggleCategory,
  onSubmit,
  editSubmitting,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Artwork</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalBody} showsVerticalScrollIndicator={false}>
              {/* Images Section */}
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.editLabel}>Images (Max 5)</Text>

                {/* Image Grid */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {/* Existing Images */}
                  {existingImages.map((imageUrl, index) => (
                    <View key={`existing-${index}`} style={styles.editImagePreview}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.editImagePreviewImage}
                      />
                      <TouchableOpacity
                        onPress={() => onRemoveExistingImage(imageUrl)}
                        style={styles.editImageRemoveBtn}
                      >
                        <Ionicons name="close-circle" size={26} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* New Images */}
                  {newImages.map((imageObj) => (
                    <View key={imageObj.id} style={styles.editImagePreview}>
                      <Image
                        source={{ uri: imageObj.uri }}
                        style={styles.editImagePreviewImage}
                      />
                      <TouchableOpacity
                        onPress={() => onRemoveNewImage(imageObj.id)}
                        style={styles.editImageRemoveBtn}
                      >
                        <Ionicons name="close-circle" size={26} color="#fff" />
                      </TouchableOpacity>
                      <View style={styles.editImageNewBadge}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>NEW</Text>
                      </View>
                    </View>
                  ))}

                  {/* Add Image Button */}
                  {existingImages.length + newImages.length < 5 && (
                    <TouchableOpacity
                      onPress={onPickNewImages}
                      style={styles.editAddImageBtn}
                    >
                      <Ionicons name="add" size={32} color="#A68C7B" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Title Input */}
              <Text style={styles.editLabel}>Title *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="Enter artwork title"
                value={editTitle}
                onChangeText={onChangeTitle}
              />

              {/* Medium Input */}
              <Text style={styles.editLabel}>Medium *</Text>
              <TextInput
                style={styles.editInput}
                placeholder="e.g., Oil on Canvas, Digital Art"
                value={editMedium}
                onChangeText={onChangeMedium}
              />

              {/* Description Input */}
              <Text style={styles.editLabel}>Description *</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                placeholder="Describe your artwork..."
                value={editDescription}
                onChangeText={onChangeDescription}
                multiline
                numberOfLines={4}
              />

              {/* Categories */}
              <Text style={styles.editLabel}>Categories *</Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => onToggleCategory(category)}
                    style={[
                      styles.editCategoryBtn,
                      editCategories.includes(category) &&
                        styles.editCategoryBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.editCategoryBtnText,
                        editCategories.includes(category) &&
                          styles.editCategoryBtnTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Update Button */}
              <TouchableOpacity
                style={[styles.editSubmitBtn, editSubmitting && { opacity: 0.6 }]}
                onPress={onSubmit}
                disabled={editSubmitting}
              >
                <Text style={styles.editSubmitBtnText}>
                  {editSubmitting ? 'Updating...' : 'Update Artwork'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  editModalBody: {
    padding: 20,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  editInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
  },
  editTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editImagePreview: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
    paddingTop: 8,
    paddingRight: 8,
  },
  editImagePreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editImageRemoveBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 13,
  },
  editImageNewBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#A68C7B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editAddImageBtn: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#A68C7B',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  editCategoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A68C7B',
    backgroundColor: '#fff',
  },
  editCategoryBtnActive: {
    backgroundColor: '#A68C7B',
  },
  editCategoryBtnText: {
    fontSize: 13,
    color: '#A68C7B',
    fontWeight: '500',
  },
  editCategoryBtnTextActive: {
    color: '#fff',
  },
  editSubmitBtn: {
    backgroundColor: '#A68C7B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  editSubmitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditViewGalleryModal;

