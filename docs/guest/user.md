### HOTEL MANAGMENT SYSTEM

### GUEST


## CREATE GUEST


##### API
```
 {baseUrl}/guest/create
```

#### request data

```json
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

#### response data 

```json
{
  "id": 1,
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

### GUEST UPDATE

#### API

- make sure add id on path/api 

```
{baseUrl}/guest/update/{id}
```

#### request data

- ? -> it's mean you can send anything on this 

```json

  {
  "firstName ?": "Rahul",
  "lastName ?": "Sharma",
  "phone ?": "9876543210",
  "email ?": "rahul@gmail.com",
  "idProofType ?" : "AADHAR_CARD",
  "idProofNumber ?" : "123456789012",
  "address ?": "MG Road",
  "city ?": "Indore",
  "state ?": "Madhya Pradesh",
  "postalCode ?" : "452001"
}  


```


#### response data 

```json
{
  "id": 1,
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


### GUEST GET

#### API

- make sure add id on path/api 

```
{baseUrl}/guest/{id}
```

#### request data

```
no data need
```

#### response data 

```json
{
  "id": 1,
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


### GUEST DELETE

#### API

- make sure add id on path/api 

```
{baseUrl}/guest/delete/{id}
```

#### request data

```
no data need
```

#### response data 

```
no data 
```