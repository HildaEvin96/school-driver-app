#  School Driver App

A React Native mobile application designed for school bus drivers to manage daily student pickup and drop-off trips efficiently.

The application allows drivers to select routes, manage student pickup/drop-off status, track trip delays, view trip history, and securely log in using Firebase Phone OTP Authentication.

##  Features

-  Driver Login using Firebase Phone OTP Authentication
-  Driver Profile Management
-  Route Selection
-  Student Pickup Management
-  Student Drop-off Management
-  Mark students as Picked Up / Dropped Off
-  Mark students as Absent
-  Location-wise Student Grouping
-  Open Pickup and Drop-off Locations in Maps
-  Add Trip Delay
-  End Trip with Confirmation
-  Trip History
-  Light & Dark Mode Support
-  Offline Local Storage using SQLite
-  REST API Data Synchronization

##  Technologies Used

- React Native
- Expo
- Expo Router
- TypeScript
- Firebase Authentication
- Firebase Firestore
- Zustand
- SQLite
- REST API

## 🏗️ Project Architecture

The project follows a structured architecture to separate UI, business logic, data access, and state management.

```text
school-driver-app/
│
├── api/             # REST API services
├── app/             # Application screens and navigation
├── components/      # Reusable UI components
├── config/          # Application configuration
├── context/         # Authentication and theme context
├── database/        # SQLite database and migrations
├── repository/      # Data repository layer
├── store/           # Zustand state management
├── types/           # TypeScript models/types
└── usecases/        # Application business logic
```

##  Main Screens

- Login
- OTP Verification
- Driver Signup
- Home
- Current Trip
- Pickup
- Drop-off
- Student Details
- Trip History
- Settings

## 🔄 Application Flow

```text
Driver Login
     ↓
OTP Verification
     ↓
Driver Authentication
     ↓
Home
     ↓
Select Route
     ↓
Pickup / Drop-off Trip
     ↓
Update Student Status
     ↓
End Trip
     ↓
Trip History
```

##  Data Flow

The application uses REST APIs, SQLite, and Zustand for managing application data.

```text
REST API
   ↓
Repository
   ↓
SQLite Database
   ↓
Zustand Store
   ↓
React Native UI
```

SQLite provides local data storage, while Zustand manages the application's UI state.

## 🔐 Authentication

Firebase Phone Authentication is used for secure driver authentication.

```text
Phone Number
     ↓
OTP Verification
     ↓
Firebase Authentication
     ↓
Driver Profile
     ↓
Application
```

Firebase Firestore is used to store and retrieve driver profile information.

##  Installation

Clone the repository:

```bash
git clone https://github.com/HildaEvin96/school-driver-app.git
```

Navigate to the project:

```bash
cd school-driver-app
```

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npx expo start
```

For an Android development build:

```bash
npx expo run:android
```

## 👩 Author

**Hilda Cleetus**

Software Engineer | Android & React Native Developer