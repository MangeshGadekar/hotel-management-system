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

