/**
 * Shared testimonials data for HomePage and Gallery page
 * This ensures both pages display the same testimonial content
 */

export interface Testimonial {
  id: number;
  name: string;
  initials: string;
  location: string;
  rating: number;
  date: string;
  productPurchased: string;
  verified: boolean;
  image: string | null;
  text: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ram Kumar",
    initials: "RK",
    location: "Kathmandu",
    rating: 5,
    date: "May 15, 2025",
    productPurchased: "3-door Executive Almirah",
    verified: true,
    image: null,
    text: "I purchased a 3-door almirah for my home and I'm extremely satisfied with the quality. It's sturdy, well-designed, and the finish is excellent. The delivery team was also very professional and helped with installation."
  },
  {
    id: 2,
    name: "Sita Poudel",
    initials: "SP",
    location: "Pokhara",
    rating: 4,
    date: "April 3, 2025",
    productPurchased: "Office Desk Set",
    verified: true,
    image: null,
    text: "The office furniture I ordered for my clinic was delivered on time and exactly as described. The quality is great and my staff loves it. I would have given 5 stars but the assembly instructions could be clearer."
  },
  {
    id: 3,
    name: "Bikash Thapa",
    initials: "BT",
    location: "Lalitpur",
    rating: 5,
    date: "May 23, 2025",
    productPurchased: "Custom Office Cabinet",
    verified: true,
    image: null,
    text: "I had a custom order for my office and the team at Manish Steel was very helpful. They understood my requirements perfectly and delivered a great product. Will definitely order again for my new branch office."
  },
  {
    id: 4,
    name: "Anita Sharma",
    initials: "AS",
    location: "Bhaktapur",
    rating: 5,
    date: "June 2, 2025",
    productPurchased: "Kitchen Storage Unit",
    verified: true,
    image: null,
    text: "The kitchen storage unit is perfect for my small space. It's well-designed with adjustable shelves and very sturdy. The rust-resistant coating gives me peace of mind for long-term use in the kitchen area."
  },
  {
    id: 5,
    name: "Rajesh Magar",
    initials: "RM",
    location: "Butwal",
    rating: 5,
    date: "May 30, 2025",
    productPurchased: "Filing Cabinet",
    verified: true,
    image: null,
    text: "As a small business owner, organized storage is essential. The filing cabinet I purchased has excellent build quality and smooth drawer operation. Customer service was responsive when I had questions about dimensions."
  },
  {
    id: 6,
    name: "Suresh Kumar",
    initials: "SK",
    location: "Corporate Client",
    rating: 5,
    date: "June 1, 2025",
    productPurchased: "Office Furniture Set",
    verified: true,
    image: null,
    text: "The quality of furniture from Manish Steel is exceptional. Their attention to detail and craftsmanship is unmatched. We furnished our entire office with their products and couldn't be happier with the results."
  }
];

export default testimonials;
