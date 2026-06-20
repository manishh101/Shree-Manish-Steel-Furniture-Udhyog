/**
 * FAQ Content Library
 *
 * Common questions and answers for Manish Steel Furniture.
 * Organized by topic and naturally integrated with dual keywords.
 * Used on the /faq page, product pages, and category pages.
 *
 * Requirements: 5.5, 7.3
 */

import { FAQItem } from '../../components/FAQSection';

/** General / delivery / warranty FAQs shown site-wide */
export const GENERAL_FAQS: FAQItem[] = [
  {
    question: 'Do you deliver furniture to Dharan, Itahari, and other areas?',
    answer:
      'Yes, we offer free home delivery across Biratnagar, Dharan, Itahari, Damak, and Birtamod. Delivery is also available to Morang and Sunsari districts. For areas beyond these, delivery charges may apply. Call or WhatsApp us at +977 9824336371 to confirm delivery to your location.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept cash, eSewa, Khalti, bank transfer, and cheque payments. For large orders above Rs. 50,000 we also offer installment arrangements. All prices are in Nepali Rupees (NPR).',
  },
  {
    question: 'What is the warranty on your steel furniture?',
    answer:
      'All our steel almirahs (daraj), office furniture, powder coating services, and other products carry a 5-year manufacturing warranty against structural defects, welding failures, and coating defects. Cosmetic damage from misuse is not covered. Contact us to claim warranty service.',
  },
  {
    question: 'Can I get custom-sized furniture made to order?',
    answer:
      'Yes, we manufacture custom furniture to your exact dimensions and specifications. Popular customizations include non-standard almirah (daraj) sizes, special colors, modified internal layouts, and branded office furniture. Lead time for custom orders is typically 7–14 working days.',
  },
  {
    question: 'Do you provide free installation after delivery?',
    answer:
      'Yes, free assembly and installation is included with all furniture deliveries in Biratnagar, Dharan, and Itahari. Our team will install the almirah, office furniture, or other items in your preferred room.',
  },
  {
    question: 'What are your showroom timings and location?',
    answer:
      'Our showroom is located on Dharan Road, Biratnagar, Morang. We are open Sunday to Friday from 7:00 AM to 7:00 PM and Saturday from 8:00 AM to 5:00 PM. You can also browse our full catalog online and place orders by calling or WhatsApp at +977 9824336371.',
  },
  {
    question: 'What sizes of almirahs (daraj) are available?',
    answer:
      'We stock almirahs in 48-inch, 60-inch, 66-inch, and 72-inch heights. The most popular sizes are 66-inch (medium bedroom daraj) and 72-inch (master bedroom wardrobe). Custom heights are also available on order. Width and depth can also be customized.',
  },
  {
    question: 'What steel thickness is used in your furniture?',
    answer:
      'We use 22-gauge (0.8 mm) premium cold-rolled steel for our main frames and panels, which is industry standard for residential steel furniture. Our heavy-duty commercial and office products use 20-gauge (1.0 mm) steel for extra durability.',
  },
  {
    question: 'How do I care for and maintain steel furniture?',
    answer:
      'Steel furniture is low maintenance. Wipe with a dry or lightly damp cloth to remove dust. Avoid abrasive cleaners that scratch the powder coating. In humid climates, ensure good ventilation around furniture. For minor scratches, touch-up paint in matching colors is available from us.',
  },
  {
    question: 'Do you offer bulk or wholesale pricing for hotels, offices, and institutions?',
    answer:
      'Yes, we offer special wholesale pricing for bulk orders above 10 units. We regularly supply to hotels, schools, government offices, hospitals, and construction projects across Province 1. Contact us at +977 9824336371 or visit our showroom for a quotation.',
  },
];

/** Product category-specific FAQs */
export const ALMIRAH_FAQS: FAQItem[] = [
  {
    question: 'Which almirah (daraj) size is best for a standard Nepali bedroom?',
    answer:
      'For a standard Nepali bedroom, the 66-inch (5.5 feet) almirah is most popular as it fits comfortably without dominating the room. For a master bedroom or if you need more storage, the 72-inch (6 feet) daraj is recommended. Measure your wall space and leave at least 3 feet in front for door clearance.',
  },
  {
    question: 'What is the difference between a Ladies Gents almirah and a regular wardrobe?',
    answer:
      'A Ladies Gents almirah (daraj) has a specially designed interior with separate sections for ladies and gents clothing. The ladies\' side has longer hanging space for sarees and dresses, plus smaller shelves for folded clothes. The gents\' side has shorter hanging for shirts, suit storage, and trouser racks — all in one unit.',
  },
  {
    question: 'Can I get an almirah with a mirror (aina)?',
    answer:
      'Yes, most of our almirahs (daraj) are available with an optional full-length mirror on the center door. Mirror door options are available for 2-door, 3-door, and 4-door models. You can also get a separate dressing table (singarne table) to pair with your almirah.',
  },
];

export const POWDER_COATING_FAQS: FAQItem[] = [
  {
    question: 'What are the benefits of powder coating steel furniture?',
    answer:
      'Powder coating provides a significantly more durable, thick, and premium finish than traditional liquid paint. It is highly resistant to scratches, chipping, fading, and rust. It is also environmentally friendly, as it contains no volatile organic compounds (VOCs) and produces minimal waste.',
  },
  {
    question: 'Do you offer powder coating services for external metal products?',
    answer:
      'Yes! In addition to coating our own steel almirahs and office furniture, we provide high-quality custom powder coating services for external metal furniture, machinery parts, window frames, railings, gates, and other industrial steel or aluminum components. Contact us for a quote based on your parts size.',
  },
];

export const OFFICE_FAQS: FAQItem[] = [
  {
    question: 'Do you make office furniture for businesses and government offices?',
    answer:
      'Yes, office furniture is one of our specialties. We manufacture filing cabinets, executive desks, L-shaped computer desks, office almirahs, reception counters, and conference tables. We supply to banks, schools, hospitals, and government offices across Province 1. Bulk order discounts available.',
  },
  {
    question: 'What is the lead time for a complete office fitout?',
    answer:
      'For standard office furniture from stock, delivery is within 3–5 working days. For custom office fitouts (branded colors, special sizes, modular workstations), the lead time is 10–21 working days depending on order size. We offer a free site visit and layout planning service.',
  },
];

/** Delivery-specific FAQs */
export const DELIVERY_FAQS: FAQItem[] = [
  {
    question: 'Which areas do you deliver to for free?',
    answer:
      'We provide free home delivery within Biratnagar city limits, Dharan, and Itahari. This includes all major neighborhoods and surrounding areas within 10-15 km radius.',
  },
  {
    question: 'What is the delivery cost for areas outside the free delivery zone?',
    answer:
      'For locations beyond our free delivery zone (Damak, Birtamod, Urlabari, and other Morang/Sunsari areas), delivery charges range from Rs. 500 to Rs. 2,000 depending on distance and furniture size. We calculate the exact cost before confirming your order.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'In-stock items are delivered within 1-2 working days in Biratnagar, 2-3 days in Dharan and Itahari. Custom orders take 7-14 working days for manufacturing plus 1-2 days for delivery. We call ahead to confirm a convenient delivery time.',
  },
  {
    question: 'Do you provide installation service with delivery?',
    answer:
      'Yes, all furniture deliveries include free professional installation and assembly. Our trained technicians will set up your almirah (daraj), office furniture, or other items at your specified location and test all locks, hinges, and moving parts.',
  },
];

/** Payment-specific FAQs */
export const PAYMENT_FAQS: FAQItem[] = [
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept Cash on Delivery (COD), eSewa, Khalti, Bank Transfer (NIC Asia, Nepal Bank, Prabhu Bank), and Cheque payments. Digital payments through eSewa and Khalti receive instant confirmation.',
  },
  {
    question: 'Do I need to pay in full or can I pay in installments?',
    answer:
      'For orders above Rs. 50,000, we offer flexible installment options. You can pay 50% advance and the remaining 50% within 30 days of delivery. For bulk institutional orders, we provide invoice-based payment terms of 30-45 days.',
  },
  {
    question: 'When do I need to make payment?',
    answer:
      'For in-stock items with Cash on Delivery, payment is due upon delivery. For custom orders, we require 30% advance payment to begin manufacturing, with the balance due on delivery. Digital payment users can pay full amount in advance for priority processing.',
  },
  {
    question: 'Is there any additional charge for digital payments?',
    answer:
      'No, we do not charge any extra fees for eSewa, Khalti, or bank transfer payments. The price you see is the final price. Transaction charges, if any, are borne by us.',
  },
];

/** Warranty and Returns FAQs */
export const WARRANTY_FAQS: FAQItem[] = [
  {
    question: 'What does the 5-year warranty cover?',
    answer:
      'Our warranty covers manufacturing defects including structural failures, welding breaks, powder coating peeling or bubbling, and lock mechanism failures. It does not cover damage from misuse, accidents, modifications, or normal wear and tear from daily use.',
  },
  {
    question: 'How do I claim warranty service?',
    answer:
      'Contact us at +977 9824336371 or visit our showroom with your purchase invoice. Our technician will inspect the furniture and provide free repair or replacement if the issue is covered under warranty. For major issues, we arrange free pickup and delivery.',
  },
  {
    question: 'Can I return furniture if I don\'t like it?',
    answer:
      'Custom-made furniture cannot be returned as it\'s manufactured to your specifications. For standard in-stock items, returns are accepted within 3 days of delivery if the product is unused, undamaged, and in original packaging. A 10% restocking fee applies to returned items.',
  },
  {
    question: 'What if the furniture arrives damaged?',
    answer:
      'If furniture arrives damaged during delivery, refuse acceptance and immediately call us at +977 9824336371. We will arrange for a replacement or repair at no charge. Always inspect furniture before accepting delivery and note any visible damage on the delivery receipt.',
  },
];

/** Custom Orders FAQs */
export const CUSTOM_ORDER_FAQS: FAQItem[] = [
  {
    question: 'Can you make furniture in custom sizes?',
    answer:
      'Yes, we specialize in custom-sized steel furniture. Whether you need a taller almirah (daraj) for extra storage, a narrower wardrobe to fit a tight space, or a specific desk dimension, we manufacture exactly to your requirements. Bring your measurements to our showroom for a quote.',
  },
  {
    question: 'What custom options are available for color and finish?',
    answer:
      'We offer powder coating in over 50 colors including all standard RAL colors. Popular choices include cream, white, grey, blue, green, and wood-grain finishes. You can also request dual-tone combinations (e.g., white body with blue doors). Bring a color sample for exact matching.',
  },
  {
    question: 'Can I customize the internal layout of an almirah?',
    answer:
      'Absolutely. You can customize shelf heights, add extra hanging rods, include trouser racks, install pull-out drawers, add a built-in safe, or modify the door configuration. Our design team will create a layout plan based on your storage needs before manufacturing begins.',
  },
  {
    question: 'How long does it take to manufacture custom furniture?',
    answer:
      'Standard custom orders (size or color modifications) take 7-10 working days. Complex customizations with special internal layouts or unique designs may take 14-21 days. We provide a confirmed delivery date when you place your order and send progress photos if requested.',
  },
  {
    question: 'Is there an extra charge for custom orders?',
    answer:
      'Simple customizations like non-standard sizes or color changes have minimal additional cost (0-10% extra). Complex modifications with special components, intricate designs, or premium finishes may cost 15-30% more than standard models. We provide a detailed quote before starting work.',
  },
];

/** All FAQs combined for the /faq page */
export const ALL_FAQS: FAQItem[] = [
  ...GENERAL_FAQS,
  ...ALMIRAH_FAQS,
  ...POWDER_COATING_FAQS,
  ...OFFICE_FAQS,
  ...DELIVERY_FAQS,
  ...PAYMENT_FAQS,
  ...WARRANTY_FAQS,
  ...CUSTOM_ORDER_FAQS,
];
