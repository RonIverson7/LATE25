import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, Clipboard, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderDetailsModalSimple = ({ visible, order, onClose, onCancel, onMarkDelivered }) => {
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = async () => {
    try {
      await Clipboard.setString(order.trackingNumber);
      setCopiedTracking(true);
      Alert.alert('Copied', 'Tracking number copied to clipboard');
      setTimeout(() => setCopiedTracking(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy tracking number');
    }
  };

  const getStatusBadge = () => {
    if (order.status === 'cancelled') {
      return { text: 'Cancelled', color: '#F44336' };
    }
    if (order.paymentStatus === 'paid' && order.status === 'pending') {
      return { text: 'To Ship', color: '#2196F3' };
    }
    if (order.status === 'processing') {
      return { text: 'Processing', color: '#2196F3' };
    }
    if (order.status === 'shipped') {
      return { text: 'Shipping', color: '#A68C7B' };
    }
    if (order.status === 'delivered') {
      return { text: 'Delivered', color: '#4CAF50' };
    }
    return { text: order.status?.toUpperCase() || 'PENDING', color: '#999' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const statusBadge = getStatusBadge();

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Order Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Order ID:</Text>
                  <Text style={styles.detailValue}>{order.orderId}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
                    <Text style={styles.statusBadgeText}>{statusBadge.text}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Order Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
                </View>
                {order.paidAt && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Paid At:</Text>
                    <Text style={styles.detailValue}>{formatDate(order.paidAt)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Image
                      source={{ uri: item.itemImage || 'https://via.placeholder.com/80' }}
                      style={styles.orderItemImage}
                    />
                    <View style={styles.orderItemDetails}>
                      <Text style={styles.orderItemTitle}>{item.itemTitle}</Text>
                      <Text style={styles.orderItemQty}>Quantity: {item.quantity}</Text>
                      <Text style={styles.orderItemPrice}>{formatPrice(item.price)} each</Text>
                    </View>
                    <Text style={styles.orderItemTotal}>{formatPrice(item.price * item.quantity)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <View style={styles.addressDetails}>
                  <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
                  <Text style={styles.addressText}>{order.shippingAddress.phone}</Text>
                  <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
                  <Text style={styles.addressText}>
                    {order.shippingAddress.barangay}, {order.shippingAddress.city}
                  </Text>
                  <Text style={styles.addressText}>
                    {order.shippingAddress.province} {order.shippingAddress.postalCode}
                  </Text>
                </View>
              </View>
            )}

            {/* Tracking */}
            {order.trackingNumber && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Tracking Information</Text>
                <View style={styles.trackingBox}>
                  <Ionicons name="cube-outline" size={24} color="#A68C7B" />
                  <View style={styles.trackingBoxContent}>
                    <Text style={styles.trackingBoxLabel}>Tracking Number</Text>
                    <Text style={styles.trackingBoxNumber}>{order.trackingNumber}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyButton, copiedTracking && styles.copyButtonActive]}
                    onPress={handleCopyTracking}
                  >
                    <Ionicons
                      name={copiedTracking ? 'checkmark' : 'copy'}
                      size={18}
                      color={copiedTracking ? '#4CAF50' : '#A68C7B'}
                    />
                  </TouchableOpacity>
                </View>
                {order.shippedAt && (
                  <Text style={styles.trackingDate}>Shipped on: {formatDate(order.shippedAt)}</Text>
                )}
              </View>
            )}

            {/* Payment Summary */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.paymentSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>{formatPrice(order.totalAmount)}</Text>
                </View>
                {order.paymentFee > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Payment Fee:</Text>
                    <Text style={styles.summaryValue}>{formatPrice(order.paymentFee)}</Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total:</Text>
                  <Text style={styles.summaryTotalValue}>{formatPrice(order.totalAmount)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer - Only show if there are actions */}
          {(order.paymentStatus === 'pending' && order.status !== 'cancelled') || order.status === 'shipped' ? (
            <View style={styles.modalFooter}>
              {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
                <TouchableOpacity
                  style={styles.modalBtnDanger}
                  onPress={() => onCancel(order.orderId)}
                >
                  <Text style={styles.modalBtnDangerText}>Cancel Order</Text>
                </TouchableOpacity>
              )}

              {order.status === 'shipped' && (
                <TouchableOpacity
                  style={styles.modalBtnSuccess}
                  onPress={() => onMarkDelivered(order.orderId)}
                >
                  <Text style={styles.modalBtnSuccessText}>Mark as Received</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderItemPrice: {
    fontSize: 12,
    color: '#999',
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A68C7B',
    alignSelf: 'center',
  },
  addressDetails: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  trackingBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackingBoxContent: {
    marginLeft: 12,
    flex: 1,
  },
  trackingBoxLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  trackingBoxNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A68C7B',
  },
  trackingDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  copyButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#A68C7B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  paymentSummary: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A68C7B',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  modalBtnDanger: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnDangerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtnSuccess: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnSuccessText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailsModalSimple;
