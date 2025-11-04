# Smart Car Parking (Software based, HARDWARE IMPLEMENTATION DONE BY ADEL MUMBA )

NAME: CHIMWEMWE KAMANGA

STUDENT ID: 2021394859

CONTACT NUMBER: 0954846892

FIREBASE CONNECTION


## Features

### Core Features

- **Real-time Occupancy Map**: Visual representation of parking spots with live status updates
- **Interactive Spot Details**: Click any spot to view detailed information including:
  - Spot ID and current status
  - Last updated timestamp
  - Occupancy duration
  - Maintenance controls
- **Live Statistics**: Real-time metrics showing:
  - Total parking spots
  - Available spots
  - Occupied spots
  - Occupancy percentage
- **Connection Status**: Visual indicator for system connectivity

### Premium Design

- **Glass Morphism UI**: Modern glass-effect design with backdrop blur
- **Gradient Backgrounds**: Beautiful gradient overlays for visual appeal
- **Responsive Design**: Mobile-first approach with perfect scaling across devices
- **Smooth Animations**: Hover effects and transitions for enhanced UX
- **Color-coded Status**: Intuitive color system (Green: Available, Red: Occupied, Yellow: Maintenance)

### 🔧 Technical Features

- **Firebase Integration**: Real-time data synchronization with Firestore
- **ESP32 Compatible**: Designed to work with ESP32 sensor modules
- **MQTT Ready**: Prepared for MQTT communication protocol
- **Error Handling**: Robust error handling and user notifications
- **Demo Mode**: Built-in demo data for testing without hardware

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)
- **Backend**: Firebase Firestore
- **Real-time**: Firebase Realtime Database listeners

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy your Firebase configuration
4. Update `firebase-config.js` with your project details:

```javascript
const firebaseConfig = {
    apiKey: "    apiKey: "AIzaSyAiFt0vms6LFblXpgcu1jYSH4XrGFU8RTQ",
",
    authDomain: "    authDomain: "smartcar-bc22a.firebaseapp.com",
",
    projectId: "    projectId: "smartcar-bc22a",
",
    storageBucket: "    storageBucket: "smartcar-bc22a.firebasestorage.app",
",
    messagingSenderId: "    messagingSenderId: "784172495003",
",
    appId: "    appId: "1:784172495003:web:c34d18a12492a0d345163e",
"
};
```

### 2. Firestore Database Schema

Create a collection named `parking_spots` with documents following this structure:

```javascript
// Document ID: spot_1, spot_2, etc.
{
    id: "spot_1",                    // String: Unique spot identifier
    status: true,                    // Boolean: true = occupied, false = vacant
    maintenance: false,              // Boolean: true = under maintenance
    last_updated: timestamp          // Timestamp: Last status change
}
```

### 3. ESP32 Integration

For ESP32 integration, use this data structure when publishing to Firebase:

```cpp
// Example ESP32 code structure
void updateParkingSpot(String spotId, bool occupied) {
    FirebaseJson json;
    json.set("id", spotId);
    json.set("status", occupied);
    json.set("maintenance", false);
    json.set("last_updated", Firebase.getServerTime());
  
    Firebase.Firestore.setDocument(&fbdo, "parking_spots/" + spotId, &json);
}
```

### 4. Demo Data

To test the dashboard without hardware, uncomment the last line in `dashboard.js`:

```javascript
// Uncomment this line to add demo data
addDemoData();
```

## File Structure

```
DASHBOARD/
├── index.html              # Main HTML file
├── firebase-config.js      # Firebase configuration
├── dashboard.js           # Main dashboard logic
└── README.md              # This file
```

## Usage

1. Open `index.html` in a web browser
2. The dashboard will automatically connect to Firebase
3. View real-time parking spot status
4. Click on any spot for detailed information
5. Use maintenance controls as needed

## Customization

### Adding More Parking Spots

Update the `totalSpots` variable in `dashboard.js`:

```javascript
this.totalSpots = 50; // Change to your desired number
```

### Modifying Colors

Update the CSS classes in `index.html`:

```css
.occupied {
    background: linear-gradient(135deg, #your-red-1, #your-red-2);
}
.vacant {
    background: linear-gradient(135deg, #your-green-1, #your-green-2);
}
```

### Grid Layout

Modify the grid classes in the parking grid section:

```html
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Notes

- Update Firebase security rules for production use
- Implement authentication for admin access
- Use HTTPS in production environments
- Validate all data inputs from ESP32 modules

## Future Enhancements

- User authentication system
- Payment integration
- Booking system
- Camera integration
- Advanced analytics and reporting
- Mobile app companion
- Multi-location support

## License

This project is open source and available under the MIT License.

## Support

For technical support or questions, please refer to the documentation or create an issue in the project repository.
