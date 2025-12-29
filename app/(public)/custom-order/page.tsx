'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { customOrderAPI } from '@/services/api';

interface CustomOrderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  productType: 'household' | 'office' | 'wood' | 'steel' | 'other';
  requirements: string;
  width?: string;
  height?: string;
  depth?: string;
  color?: string;
  budget?: string;
  terms?: boolean;
}

const CustomOrderPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomOrderFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');
  
  const onSubmit = async (data: CustomOrderFormData) => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Format dimensions as object matching the model
      const dimensions = {
        width: data.width || undefined,
        height: data.height || undefined,
        depth: data.depth || undefined
      };
      
      // Only include dimensions if at least one value is provided
      const hasDimensions = data.width || data.height || data.depth;
      
      const formattedData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        productType: data.productType,
        requirements: data.requirements,
        dimensions: hasDimensions ? dimensions : undefined,
        color: data.color || undefined,
        budget: data.budget || undefined
      };
      
      await customOrderAPI.create(formattedData);
      
      setIsSubmitted(true);
      reset();
      
      let timeLeft = 3;
      setCountdown(timeLeft);
      const countdownTimer = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownTimer);
          window.location.reload();
        }
      }, 1000);
    } catch (error: unknown) {
      console.error('Error submitting custom order:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to submit order. Please try again.';
        setErrorMessage(errorMsg);
      } else if (error && typeof error === 'object' && 'request' in error) {
        setErrorMessage('Unable to connect to server. Please check your connection and try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Customized Order</h1>
          <p className="text-lg md:text-xl max-w-3xl">
            Need something specific? We can create custom furniture solutions tailored to your exact requirements.
          </p>
        </div>
      </section>
      
      {/* WhatsApp Contact Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Quick Order via WhatsApp</h2>
                <p className="text-gray-600 mb-6">
                  For faster service, contact us directly on WhatsApp. Our team is ready to assist you with your custom furniture needs.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Instant response during business hours</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Send photos of your desired furniture</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Get quick price quotes</span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <a 
                  href="https://wa.me/9779824336371" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center bg-[#25D366] text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <p className="mt-4 text-sm text-gray-500">Business hours: Sun-Fri, 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Custom Order Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Tell Us What You Need</h2>
              
              {isSubmitted ? (
                // Success State
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-4">Order Submitted Successfully! 🎉</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you for your custom order request. We have received your requirements and will contact you shortly with a detailed quote.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-700 font-medium">What happens next?</p>
                    <ul className="text-green-600 text-left mt-2 space-y-1">
                      <li>• Our team will review your requirements</li>
                      <li>• We&apos;ll prepare a detailed quote within 24 hours</li>
                      <li>• You&apos;ll receive a call or email with pricing and timeline</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">
                    This page will refresh automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </p>
                </div>
              ) : (
                // Original Form
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Error Message Display */}
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 font-medium">{errorMessage}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name <span className="text-red-500">*</span></label>
                      <input
                        id="name"
                        type="text"
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Your full name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input
                        id="email"
                        type="email"
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Your email address"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <input
                        id="phone"
                        type="tel"
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Your phone number"
                        {...register('phone', { required: 'Phone number is required' })}
                      />
                      {errors.phone && <p className="mt-1 text-red-500 text-sm">{errors.phone.message}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="productType" className="block text-gray-700 font-medium mb-2">Product Type <span className="text-red-500">*</span></label>
                      <select
                        id="productType"
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.productType ? 'border-red-500' : 'border-gray-300'}`}
                        {...register('productType', { required: 'Product type is required' })}
                      >
                        <option value="">Select a product type</option>
                        <option value="household">Household Furniture</option>
                        <option value="office">Office Furniture</option>
                        <option value="steel">Steel Products</option>
                        <option value="wood">Wooden Products</option>
                        <option value="other">Other (Please specify)</option>
                      </select>
                      {errors.productType && <p className="mt-1 text-red-500 text-sm">{errors.productType.message}</p>}
                    </div>
                  </div>
                  
                  {/* Address Field */}
                  <div>
                    <label htmlFor="address" className="block text-gray-700 font-medium mb-2">Delivery Address <span className="text-red-500">*</span></label>
                    <textarea
                      id="address"
                      rows={2}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter your complete delivery address"
                      {...register('address', { required: 'Delivery address is required' })}
                    ></textarea>
                    {errors.address && <p className="mt-1 text-red-500 text-sm">{errors.address.message}</p>}
                  </div>
                  
                  {/* Order Details */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Dimensions (if applicable)</label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Width (cm)"
                            {...register('width')}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Height (cm)"
                            {...register('height')}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Depth (cm)"
                            {...register('depth')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Preferred Color/Material</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center space-x-2 transition-all hover:text-primary cursor-pointer">
                          <input type="radio" value="blue" {...register('color')} className="text-primary" />
                          <span>Blue</span>
                        </label>
                        <label className="flex items-center space-x-2 transition-all hover:text-primary cursor-pointer">
                          <input type="radio" value="brown" {...register('color')} className="text-primary" />
                          <span>Brown</span>
                        </label>
                        <label className="flex items-center space-x-2 transition-all hover:text-primary cursor-pointer">
                          <input type="radio" value="maroon" {...register('color')} className="text-primary" />
                          <span>Maroon</span>
                        </label>
                        <label className="flex items-center space-x-2 transition-all hover:text-primary cursor-pointer">
                          <input type="radio" value="pink" {...register('color')} className="text-primary" />
                          <span>Pink</span>
                        </label>
                        <label className="flex items-center space-x-2 transition-all hover:text-primary cursor-pointer">
                          <input type="radio" value="water-blue" {...register('color')} className="text-primary" />
                          <span>Water Blue</span>
                        </label>
                        <label className="flex items-center space-x-2 transition-all hover:text-primary cursor-pointer">
                          <input type="radio" value="grey" {...register('color')} className="text-primary" />
                          <span>Grey</span>
                        </label>
                        <label className="flex items-center space-x-2 transition-all hover:text-primary cursor-pointer">
                          <input type="radio" value="other" {...register('color')} className="text-primary" />
                          <span>Other</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="requirements" className="block text-gray-700 font-medium mb-2">Description &amp; Requirements <span className="text-red-500">*</span></label>
                      <textarea
                        id="requirements"
                        rows={5}
                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.requirements ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Please describe your requirements in detail..."
                        {...register('requirements', { required: 'Please describe your requirements' })}
                      ></textarea>
                      {errors.requirements && <p className="mt-1 text-red-500 text-sm">{errors.requirements.message}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="budget" className="block text-gray-700 font-medium mb-2">Budget Range (NPR)</label>
                      <select
                        id="budget"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        {...register('budget')}
                      >
                        <option value="">Select a budget range</option>
                        <option value="under-10000">Under 10,000</option>
                        <option value="10000-20000">10,000 - 20,000</option>
                        <option value="20000-30000">20,000 - 30,000</option>
                        <option value="30000-50000">30,000 - 50,000</option>
                        <option value="above-50000">Above 50,000</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      className={`h-5 w-5 text-primary transition-all ${errors.terms ? 'border-red-500' : ''}`}
                      defaultChecked={true}
                      {...register('terms')}
                    />
                    <label htmlFor="terms" className="ml-2 text-gray-700">
                      I agree to the <Link href="/terms" className="text-primary hover:underline">terms and conditions</Link>
                    </label>
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`font-bold py-3 px-8 rounded-md transition-all hover:scale-105 ${
                        isSubmitting 
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                          : 'bg-primary text-white hover:bg-primary/80'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Custom Order Request'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Custom Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">Why Choose Custom Furniture?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary text-center mb-2">Perfect Fit</h3>
              <p className="text-gray-600 text-center">
                Custom furniture is designed to fit your specific space requirements, ensuring optimal use of available area.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary text-center mb-2">Unique Design</h3>
              <p className="text-gray-600 text-center">
                Express your personal style with furniture that&apos;s uniquely yours, designed to match your aesthetic preferences.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary text-center mb-2">Quality Assurance</h3>
              <p className="text-gray-600 text-center">
                Our custom furniture is crafted with the same high-quality materials and attention to detail as our standard products.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomOrderPage;
