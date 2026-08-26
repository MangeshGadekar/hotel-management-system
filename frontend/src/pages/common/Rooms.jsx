// import React, { useState, useEffect } from 'react';
// import loadScript from '../../config/rozarpay';

// const RoomBooking = () => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     customerName: '',
//     customerEmail: '',
//     customerPhone: '',
//     checkIn: '',
//     checkOut: '',
//     roomType: 'standard',
//     numberOfGuests: 1,
//     specialRequests: ''
//   });

//   const [roomDetails, setRoomDetails] = useState({
//     standard: { price: 2000, available: true },
//     deluxe: { price: 3500, available: true },
//     suite: { price: 5000, available: true }
//   });

//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [nights, setNights] = useState(0);

//   // Calculate total amount and nights
//   useEffect(() => {
//     if (formData.checkIn && formData.checkOut) {
//       const checkIn = new Date(formData.checkIn);
//       const checkOut = new Date(formData.checkOut);
//       const diffTime = Math.abs(checkOut - checkIn);
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//       setNights(diffDays || 1);
      
//       const roomPrice = roomDetails[formData.roomType]?.price || 0;
//       const total = roomPrice * (diffDays || 1);
//       setTotalAmount(total);
//     }
//   }, [formData.checkIn, formData.checkOut, formData.roomType, roomDetails]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const validateForm = () => {
//     const { customerName, customerEmail, customerPhone, checkIn, checkOut } = formData;
//     if (!customerName || !customerEmail || !customerPhone || !checkIn || !checkOut) {
//       alert('Please fill in all required fields');
//       return false;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
//       alert('Please enter a valid email address');
//       return false;
//     }
//     if (!/^[0-9]{10}$/.test(customerPhone)) {
//       alert('Please enter a valid 10-digit phone number');
//       return false;
//     }
//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);
//     if (checkInDate >= checkOutDate) {
//       alert('Check-out date must be after check-in date');
//       return false;
//     }
//     if (checkInDate < new Date()) {
//       alert('Check-in date cannot be in the past');
//       return false;
//     }
//     return true;
//   };

//   const createBooking = async (paymentId) => {
//     const bookingData = {
//       ...formData,
//       totalAmount,
//       nights,
//       paymentId,
//       bookingDate: new Date().toISOString(),
//       status: 'confirmed'
//     };

//     try {
//       // Store booking in your backend
//       const response = await fetch('/api/bookings/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(bookingData)
//       });

//       if (response.ok) {
//         const booking = await response.json();
//         alert(`Booking confirmed! Booking ID: ${booking.id}`);
//         // Reset form
//         setFormData({
//           customerName: '',
//           customerEmail: '',
//           customerPhone: '',
//           checkIn: '',
//           checkOut: '',
//           roomType: 'standard',
//           numberOfGuests: 1,
//           specialRequests: ''
//         });
//       }
//     } catch (error) {
//       console.error('Error creating booking:', error);
//       alert('Booking created but failed to save. Please contact support.');
//     }
//   };

//   const initiateRazorpayPayment = async () => {
//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       // Load Razorpay script
//       await loadScript('https://checkout.razorpay.com/v1/checkout.js');

//       // Create order on your backend
//       const response = await fetch('/api/payments/create-order', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           amount: totalAmount * 100, // Convert to paise
//           currency: 'INR',
//           receipt: `booking_${Date.now()}`
//         })
//       });

//       const orderData = await response.json();

//       const options = {
//         key: process.env.REACT_APP_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Hotel Management',
//         description: `Room Booking - ${formData.roomType.toUpperCase()} (${nights} nights)`,
//         order_id: orderData.id,
//         handler: function (response) {
//           // Payment successful
//           alert('Payment Successful!');
//           createBooking(response.razorpay_payment_id);
//         },
//         prefill: {
//           name: formData.customerName,
//           email: formData.customerEmail,
//           contact: formData.customerPhone
//         },
//         theme: {
//           color: '#F37254'
//         },
//         modal: {
//           ondismiss: function() {
//             setLoading(false);
//             alert('Payment cancelled');
//           }
//         }
//       };

//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();

//     } catch (error) {
//       console.error('Payment initialization error:', error);
//       alert('Error initializing payment. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           {/* Updated title background with gradient from amber-600 to orange-500 */}
//           <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-4">
//             <h1 className="text-2xl font-bold text-white">Hotel Room Booking</h1>
//             <p className="text-orange-100 text-sm">Secure payment with Razorpay</p>
//           </div>

//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-gray-800">Guest Details</h3>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Full Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="customerName"
//                     value={formData.customerName}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     placeholder="Enter your full name"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Email <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     name="customerEmail"
//                     value={formData.customerEmail}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     placeholder="Enter your email"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Phone Number <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="tel"
//                     name="customerPhone"
//                     value={formData.customerPhone}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     placeholder="Enter 10-digit phone number"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-gray-800">Room Details</h3>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Room Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="roomType"
//                     value={formData.roomType}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   >
//                     <option value="standard">Standard Room - ₹{roomDetails.standard.price}/night</option>
//                     <option value="deluxe">Deluxe Room - ₹{roomDetails.deluxe.price}/night</option>
//                     <option value="suite">Suite - ₹{roomDetails.suite.price}/night</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Number of Guests <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="numberOfGuests"
//                     value={formData.numberOfGuests}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   >
//                     {[1, 2, 3, 4].map(num => (
//                       <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Check-in Date <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="checkIn"
//                   value={formData.checkIn}
//                   onChange={handleInputChange}
//                   min={new Date().toISOString().split('T')[0]}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Check-out Date <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="checkOut"
//                   value={formData.checkOut}
//                   onChange={handleInputChange}
//                   min={formData.checkIn || new Date().toISOString().split('T')[0]}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mt-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Special Requests
//               </label>
//               <textarea
//                 name="specialRequests"
//                 value={formData.specialRequests}
//                 onChange={handleInputChange}
//                 rows="3"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 placeholder="Any special requests (e.g., extra bed, room preferences, etc.)"
//               />
//             </div>

//             {totalAmount > 0 && (
//               <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
//                 <h4 className="font-semibold text-gray-800 mb-2">Booking Summary</h4>
//                 <div className="space-y-1 text-sm">
//                   <p className="flex justify-between">
//                     <span>Room Type:</span>
//                     <span className="capitalize">{formData.roomType}</span>
//                   </p>
//                   <p className="flex justify-between">
//                     <span>Nights:</span>
//                     <span>{nights}</span>
//                   </p>
//                   <p className="flex justify-between">
//                     <span>Price per night:</span>
//                     <span>₹{roomDetails[formData.roomType]?.price}</span>
//                   </p>
//                   <div className="border-t border-gray-300 pt-2 mt-2">
//                     <p className="flex justify-between font-bold text-lg">
//                       <span>Total Amount:</span>
//                       <span className="text-orange-600">₹{totalAmount}</span>
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="mt-8">
//               <button
//                 onClick={initiateRazorpayPayment}
//                 disabled={loading || totalAmount === 0}
//                 className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors ${
//                   loading || totalAmount === 0
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600'
//                 }`}
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Processing...
//                   </span>
//                 ) : (
//                   `Pay ₹${totalAmount} with Razorpay`
//                 )}
//               </button>
//               <p className="text-xs text-gray-500 text-center mt-2">
//                 Secure payment powered by Razorpay
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoomBooking;

import React from 'react'

const Rooms = () => {
  return (
    <div>Rooms</div>
  )
}

export default Rooms