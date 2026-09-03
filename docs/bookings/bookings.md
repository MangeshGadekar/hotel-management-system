### HOTEL MANAGMENT SYSTEM

### BOOKING

## CREATE BOOKING

##### API

```
 {baseUrl}/booking/create
```

#### request data

```json
{
  "guestId": 10,
  "roomId": 5,
  "checkInDate": "2026-08-20",
  "checkOutDate": "2026-08-23"
}
```

#### response data

```json
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
  "totalAmount": 9000.0,
  "bookingStatus": "BOOKED"
}
```

## UPDATE BOOKING

##### API

- make a sure id in path/url

```
 {baseUrl}/booking/update/{id}
```

#### request data

```json
{
  "checkInDate ?": "2026-08-20",
  "checkOutDate ?": "2026-08-23"
}
```


#### response data

```json
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
  "totalAmount": 9000.0,
  "bookingStatus": "BOOKED"
}
```

## GET BOOKING

##### API

- make a sure id in path/url

```
 {baseUrl}/booking/{id}
```


#### request data

```
no data needed
```


#### response data

```json
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
  "totalAmount": 9000.0,
  "bookingStatus": "BOOKED"
}
```


## CANCEL BOOKING

##### API

- make a sure id in path/url

```
 {baseUrl}/booking/cancel/{id}
```


#### request data

```
no data needed
```

#### response data

``` 
no data
```