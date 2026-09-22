# HOTEL MANAGMENT SYSTEM

A full-stack application with a **Spring Boot backend**, **React frontend**, and dedicated documentation for backend APIs and sample data.

## 📁 Project Structure

```text
project-root/
│
├── backend/
│   └── Spring Boot application
│
├── frontend/
│   └── React application
│
├── docs/
│   ├── Backend APIs
│   └── API usage & sample data
│
└── README.md
```

## 🛠️ Technology Stack

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- REST APIs
- Database integration

#### RUN BACKEND USING THIS COMMAND

```
mvn spring-boot:run
```

### DATABASE

- using docker 
- how to see the mysql - entries using docker cli

#### step 1:
```bash
docker exec -it [DOCKER_CONTAINER_NAME_OR_ID] bash
```

or 

```sh
docker exec -it [DOCKER_CONTAINER_NAME_OR_ID] sh
```

output
```
bash-5.1# 
```


#### step 2:
```bash
mysql -u root -p
```
- output
```bash
Enter password: [ENTER_YOUR_DATABASE_PASSWORD]
```


#### step 3:
```bash
mysql> SHOW DATABASES;
```

- output

```
DATABASE NAMES 
```

#### step 4:
```bash
USE [DATBASE_NAME];
```

- output
```
shows the database like Database changed
```

#### step 5:

```bash
mysql> SHOW TABLES;
```
- output
```
shows the database tables
```

#### step 6:

```bash
mysql> SELECT *  FROM [TABLE_NAME];
```
- output

```
shows the table query
```


### Frontend

- React
- JavaScript / TypeScript
- React Router
- API integration with the Spring Boot backend

#### RUN FRONTEND USING THIS COMMAND

```
npm run dev
```

### Documentation

The `docs` folder contains:

- Backend API documentation
- API endpoints
- Request and response formats
- Sample request data
- Sample response data
- API usage examples
