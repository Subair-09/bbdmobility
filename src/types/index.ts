export interface BookingFormData {
  serviceType: string;
  pickupLocation: string;
  dropoffLocation: string;
  packageDetails: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  deliveryInstructions: string;

  // Mapbox & Dynamic Pricing Breakdown Fields
  distanceKm?: number;
  durationMinutes?: number;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffCoordinates?: { lat: number; lng: number };
  waitingFeeApplied?: boolean;
  waitingMinutes?: number;
  baseFareApplied?: number;
  distanceChargeApplied?: number;
  timeChargeApplied?: number;
  waitingChargeApplied?: number;
  subtotalBeforeVat?: number;
  vatPercentageApplied?: number;
  vatAmount?: number;
  finalFare?: number;
  estimatedDeliveryFee?: number;
}

export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  iconName: string;
  details: string;
}

export interface TestimonialData {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatarUrl: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
