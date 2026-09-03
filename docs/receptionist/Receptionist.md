### HOTEL MANAGMENT SYSTEM

### RECEPTIONIST


## CREATE RECEPTIONIST


##### API
```
 {baseUrl}/admin/receptionist/create
```

#### request data

```json
{
  "firstName": "Amit",
  "lastName": "Kumar",
  "username": "amit",
  "email": "amit@gmail.com",
  "password": "Amit@123"
}
```

#### response data 

```json
{
  "id": 5,
  "firstName": "Amit",
  "lastName": "Kumar",
  "username": "amit",
  "email": "amit@gmail.com",
  "role": "RECEPTIONIST"
}

```

### RECEPTIONIST UPDATE

#### API

- make sure add roomNumber on path/api 

```
{baseUrl}/admin/receptionist/update/{id}
```

#### request data

- ? -> it's mean you can send anything on this 

```json
{
  "firstName ?": "Amit",
  "lastName ?": "Kumar",
  "username ?": "amit",
}

```


#### response data 

```json
{
  "id": 5,
  "firstName": "Amit",
  "lastName": "Kumar",
  "username": "amit",
  "email": "amit@gmail.com",
  "role": "RECEPTIONIST"
}
```


### RECEPTIONIST DELETE

#### API

- make sure add id on path/api 

```
{baseUrl}/admin/receptionist/delete/{id}
```

#### request data

```
no data need
```

#### response data 

```json
no data 

```


### RECEPTIONIST GET

#### API

- make sure add id on path/api 

```
{baseUrl}/admin/receptionist/{id}
```

#### request data

```
no data need
```

#### response data 

```json
{
  "id": 1,
  "roomNumber": "101",
  "roomType": "DELUXE",
  "pricePerNight": 3000.0,
  "capacity": 2,
  "roomStatus": "AVAILABLE"
}
```


### RECEPTIONIST ALL GET

#### API

```
{baseUrl}/admin/receptionist
```

#### request data

```
no data need
```

#### response data 

```json
[
    {
  "id": 1,
  "roomNumber": "101",
  "roomType": "DELUXE",
  "pricePerNight": 3000.0,
  "capacity": 2,
  "roomStatus": "AVAILABLE"
},
{
  "id": 1,
  "roomNumber": "101",
  "roomType": "DELUXE",
  "pricePerNight": 3000.0,
  "capacity": 2,
  "roomStatus": "AVAILABLE"
}
]
```
