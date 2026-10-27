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
  deliveryInstructions: string;
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
