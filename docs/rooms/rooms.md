### HOTEL MANAGMENT SYSTEM

### ROOM


## CREATE ROOM


##### API
```
 {baseUrl}/admin/room/create
```

#### request data

```json
{
  "roomNumber": "101",
  "roomType": "DELUXE",
  "pricePerNight": 3000.0,
  "capacity": 2,
  "roomStatus": "AVAILABLE"
}
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

### ROOM UPDATE

#### API

- make sure add roomNumber on path/api 

```
{baseUrl}/admin/room/update/{roomNumber}
```

#### request data

- ? -> it's mean you can send anything on this 

```json
{
  "roomType ?": "DELUXE",
  "pricePerNight ?": 3000.0,
  "capacity ?": 2,
  "roomStatus ?": "AVAILABLE"
} 

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


### ROOM DELETE

#### API

- make sure add id on path/api 

```
{baseUrl}/admin/room/delete/{roomNumber}
```

#### request data

```
no data need
```

#### response data 

```json
no data 

```


### ROOM GET

#### API

- make sure add roomNumber on path/api 

```
{baseUrl}/admin/room/get/{roomNumber}
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


### ROOM TYPE GET

#### API

- make sure add roomType on path/api 

```
{baseUrl}/admin/room/type/{roomType}
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



### ROOM STATUS GET

#### API

- make sure add roomStatus on path/api 

```
{baseUrl}/admin/room/status/{roomStatus}
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