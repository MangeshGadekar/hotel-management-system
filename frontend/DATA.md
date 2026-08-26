### Booking Request
```
{
  "guestId": 10,
  "roomId": 5,
  "checkInDate": "2026-08-20",
  "checkOutDate": "2026-08-23"
}
```


### Booking Response
```
{
  "id": 101,
  "guestId": 10,
  "guestName": "Rahul Sharma",
  "roomId": 5,
  "roomNumber": "101",
  "roomType": "DELUXE",
  "receptionistId": 3,
  "receptionistName": "Amit Kumar",
  "checkInDate": "2026-08-20",
  "checkOutDate": "2026-08-23",
  "totalAmount": 9000.00,
  "bookingStatus": "BOOKED"
}
```

### User (Admin, Receptionist) Request - sign up
```
{
  "username": "rahul",
  "email": "rahul@gmail.com",
  "password": "Rahul@123",
  "role": "RECEPTIONIST"
}
```

### Login Request
```
{
  "email": "rahul@gmail.com",
  "password": "Rahul@123"
}
```

### Guest Create request
```
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "idProofType": "AADHAR_CARD",
  "idProofNumber": "123456789012",
  "address": "MG Road",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "postalCode": "452001"
}
```

### Guest Response 
```
{
  "id": 10,
  "firstName": "Rahul",
  "lastName": "Sharma",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "idProofType": "AADHAR_CARD",
  "idProofNumber": "123456789012",
  "address": "MG Road",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "postalCode": "452001"
}
```

### Receptionist Request
```
{
  "firstName": "Amit",
  "lastName": "Kumar",
  "username": "amit",
  "email": "amit@gmail.com",
  "password": "Amit@123"
}
```

### Receptionist Response
```
{
  "id": 5,
  "firstName": "Amit",
  "lastName": "Kumar",
  "username": "amit",
  "email": "amit@gmail.com",
  "role": "RECEPTIONIST"
}
```

### create room 
```
{
  "roomNumber": "101",
  "roomType": "DELUXE",
  "pricePerNight": 3000.0,
  "capacity": 2,
  "roomStatus": "AVAILABLE"
}
```

### Room Response
```
{
  "id": 1,
  "roomNumber": "101",
  "roomType": "DELUXE",
  "pricePerNight": 3000.0,
  "capacity": 2,
  "roomStatus": "AVAILABLE"
}
```


```

 <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 relative">
          <div className="flex flex-col md:flex-row items-center md:gap-16 ">
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify">
                <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 to-transparent"></div>
                <span className="text-amber-600 font-semibold text-sm uppercase tracking-[0.3em]">
                  Welcome to Paradise
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Manage Your Hotel
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800">
                  With Excellence
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                Streamline your hotel operations with our all-in-one management
                system. From reservations to guest services, we've got you covered
                with premium solutions designed for modern hospitality.
              </p>

              <div className="flex flex-wrap gap-8 py-4">
                {[
                  { icon: FaStar, value: '4.9', label: 'Guest Rating', color: 'amber' },
                  { icon: FaUsers, value: '10k+', label: 'Happy Guests', color: 'amber' },
                  { icon: MdOutlineLocalHotel, value: '500+', label: 'Partner Hotels', color: 'amber' },
                ].map((stat, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <stat.icon className="text-amber-600 text-xl" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: MdRoomService, label: '24/7 Support', color: 'amber' },
                  { icon: FaShieldAlt, label: 'Secure Payments', color: 'green' },
                  { icon: RiHotelBedLine, label: 'Smart Booking', color: 'blue' },
                ].map((badge, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-md border border-gray-100 hover:border-${badge.color}-300 hover:shadow-lg transition-all duration-300`}
                  >
                    <badge.icon className={`text-${badge.color}-600`} />
                    <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <button className="group px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-2xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber-600/30 flex items-center gap-3 transform hover:scale-105">
                  Book Your Stay
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
                <button className="px-10 py-4 bg-white border-2 border-amber-600 text-amber-600 font-semibold rounded-2xl hover:bg-amber-50 transition-all duration-300 flex items-center gap-2 hover:shadow-lg">
                  <FaPhone className="text-sm rotate-90" />
                  Call Us
                </button>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-900/20">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Luxury Hotel"
                    className="w-full h-[400px] md:h-[500px] object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                      <span className="ml-2 text-sm text-white/80">(2,345 reviews)</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold">Grand Luxury Hotel</h3>
                    <p className="text-white/80 text-sm mt-1">
                      ⭐ 5-star experience with ocean view & private beach
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-amber-300 font-bold text-lg">$199</span>
                      <span className="text-white/60 text-sm">/ night</span>
                      <div className="w-px h-6 bg-white/20"></div>
                      <span className="text-white/80 text-sm">✨ 15% off</span>
                    </div>
                  </div>

                  {/* Decorative Corner Elements */}
                  <div className="absolute top-4 left-4 text-white/20 text-2xl">✦</div>
                  <div className="absolute top-4 right-4 text-white/20 text-2xl">✦</div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-2xl p-5 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <FaUsers className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Available Rooms</p>
                      <p className="text-xs text-gray-500">24 rooms left</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-5 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <MdRoomService className="text-amber-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Best Price</p>
                      <p className="text-xs text-gray-500">Starting from $199/night</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

```




