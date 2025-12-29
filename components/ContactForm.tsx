'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { inquiryAPI } from '../services/api';

type InquiryCategory = 'general' | 'support' | 'product' | 'service' | 'business';

interface FormData {
  name: string;
  email: string;
  phone: string;
  category: InquiryCategory;
  message: string;
}

interface SubmitStatus {
  success: boolean;
  message: string;
}

const ContactForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ success: false, message: '' });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ success: false, message: '' });

    try {
      // Validate category field specifically - default to 'general' if empty
      const category: InquiryCategory = data.category || 'general';
      
      await inquiryAPI.create({
        ...data,
        category
      });
      
      setSubmitStatus({ success: true, message: 'Inquiry sent successfully! We will get back to you soon.' });
      reset();

    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      
      let errorMessage = 'An error occurred. Please try again later.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSubmitStatus({ success: false, message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldHasError: boolean) => {
    return `w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
      fieldHasError 
        ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
    }`;
  };

  return (
    <div>
      {/* Submission Status Message */}
      {submitStatus.message && (
        <div 
          className={`mb-6 p-4 rounded-lg text-sm ${
            submitStatus.success 
              ? 'bg-green-50 text-green-700 border border-green-100' 
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}
          role="alert"
        >
          <div className="flex items-center">
            {submitStatus.success ? (
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{submitStatus.message}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            className={getInputClassName(!!errors.name)}
            placeholder="Enter your full name"
            {...register('name', { required: 'Name is required' })}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
              {errors.name.message}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
              Inquiry Type <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              className={getInputClassName(!!errors.category)}
              {...register('category', { required: 'Please select an inquiry type' })}
              disabled={isSubmitting}
              defaultValue=""
            >
              <option value="" disabled>Select Inquiry Type</option>
              <option value="product">Product Information</option>
              <option value="service">Custom Order</option>
              <option value="support">Price Quote / Delivery</option>
              <option value="business">Business/Dealership</option>
              <option value="general">General Inquiry</option>
            </select>
            {errors.category && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {errors.category.message}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={getInputClassName(!!errors.email)}
              placeholder="your.email@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={getInputClassName(!!errors.phone)}
              placeholder="e.g., 98XXXXXXXX or +977-98XXXXXXXX"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^(\+?977[-\s]?)?[9][678]\d{8}$|^\d{10}$/,
                  message: 'Please enter a valid 10-digit phone number'
                }
              })}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={5}
            className={getInputClassName(!!errors.message)}
            placeholder="How can we help you?"
            {...register('message', { required: 'Message is required' })}
            disabled={isSubmitting}
          ></textarea>
          {errors.message && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
              {errors.message.message}
            </p>
          )}
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-medium py-3 px-6 rounded-lg transition-all hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
