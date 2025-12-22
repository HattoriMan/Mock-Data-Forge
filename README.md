# Mock Data Forge

## Overview

**Mock Data Forge** is a mock data generation tool designed to solve the *cold start* problem commonly faced in software development and testing. When real data is unavailable, developers often need realistic dummy data to build user interfaces, test APIs, or evaluate database performance. Creating such data manually is time-consuming, error-prone, and not scalable.

This project provides a flexible solution that generates realistic JSON data based on a user-defined schema. It supports **CLI/API usage** and an optional **web-based graphical interface (GUI)** for interactive schema creation and automatic API posting.

---

## Problem Statement

In many development workflows, real data does not exist during early stages. Developers and testers need a way to generate structured, realistic mock data automatically.

### Objective

Build a Mock Data Generator that:

- Accepts a JSON schema describing fields and data types
- Generates valid, random, and realistic JSON data
- Supports constraints and complex data structures
- Can be used via CLI, API, or GUI

---

## Features

### Core (MVP)

- Schema-driven JSON data generation
- Command-line interface (CLI)
- API-based generation via Node.js server
- Support for multiple records generation

---

## Supported Data Types

### Primitive Types
- `string`
- `integer`
- `float`
- `boolean`

### Semantic Types
- `name`
- `email`
- `phone`
- `date`
- `uuid`

### File Types
- `image_url`
- `file_url`

### Complex Types
- `object` (nested schema support)
- `array` (with configurable length and item type)

---

## Advanced Features Implemented

### 1. Graphical User Interface (GUI)

- Web-based interface built using **Express.js**, **EJS**, and **Bootstrap**
- Dynamically add or remove fields
- Configure data types and constraints
- View generated JSON output directly in the browser
- Copy output to clipboard

#### Optional GUI API Support
- Add fields, choose types, and set constraints
- Enter API URL(s) in the "API URL" input separated via comma
- Click Generate
- JSON output is displayed and sent to the API

### 2. Constraints and Logic

- Range constraints for integers and floats (`min`, `max`)
- Enum/Choice values for strings
- Regex-based string generation
- Input validation on both frontend and backend

### 3. Automated Entry Support

- Optional API endpoint field
- Generated data can be automatically POSTed to an external API
- CLI support: *--api* argument accepts one or multiple API endpoints separated by commas to POST generated data.
- GUI support: enter one or multiple API endpoints separated by commas in the "API URL" field to automatically POST generated JSON.

Useful for testing webhooks, backend APIs, or staging databases.

### 4. Dockerization

- Fully dockerized application
- Runs both the Python generator and Node.js server in a single container

---

## Project Structure

```text
.
├── generator/
│   ├── main.py
│   ├── generator.py
│   └── requirements.txt
│
├── server/
│   ├── public/
│   │   ├── app.js
│   │   └── styles.css
│   ├── views/
│   │   └── index.ejs
│   ├── server.js
│   └── package.json
│
├── Dockerfile
├── .dockerignore
├── .gitignore
├── README.md
└── LICENSE
```

## Installation and Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Docker (Optional)

---

### 1. Local Setup (Without Docker)

#### Install Python Dependencies
```bash
pip install -r generator/requirements.txt
```
#### Install Node Dependencies
```bash
cd server
npm install
```
#### Start the Server
```bash
npm start
```
The application will be available at:
```
http://localhost:3000
```

### 2. CLI Usage (Python Only)

```bash
python generator/main.py --schema path/to/schema.json --count 5 --api http://localhost:4000/test-api,http://localhost:5000/another-test-api
```
#### Arguments
```
--schema : Path to schema JSON file
--count : Number of objects to generate (default: 1)
--api    : Optional API endpoint to automatically POST generated data
```

#### Input Schema Example
```
{
  "id": { "type": "uuid" },
  "full_name": { "type": "name" },
  "age": { "type": "integer", "min": 18, "max": 60 },
  "email": { "type": "email" },
  "is_active": { "type": "boolean" },
  "avatar": { "type": "image_url" }
}
```
#### Output Example
```
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "full_name": "John Doe",
  "age": 32,
  "email": "john.doe@example.com",
  "is_active": true,
  "avatar": "https://picsum.photos/200/300"
}
```
### 3. Docker Usage
Build the Image
```
docker build -t mock-data-forge .
```
Run the Container
```
docker run -p 3000:3000 mock-data-forge
```
Access the application at:
```
http://localhost:3000
```

### Hosting Status
Deployment Note:
This project is not currently hosted on Vercel or Netlify. It is intended to be run locally or via Docker.

---

## Future Improvements
- Authentication and user sessions  
- Export generated data to files (JSON/CSV)  
- Database integration (MongoDB/PostgreSQL)  
- More semantic data types  
- UI enhancements and schema presets 
- Deployment 


## License
This project is licensed under the terms specified in the **MIT LICENSE**.