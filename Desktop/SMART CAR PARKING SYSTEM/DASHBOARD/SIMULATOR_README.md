# Smart Parking System Simulator

## Overview
The Smart Parking System Simulator is a web application that generates realistic, event-driven data for testing and developing the parking dashboard without requiring physical hardware (ESP32 modules and sensors).

## Features

### 🎮 Simulation Controls
- **Start/Stop Simulation**: Control the simulation lifecycle
- **Pause/Resume**: Temporarily pause simulation without losing state
- **Reset All Spots**: Clear all parking spots to vacant status
- **Configurable Event Intervals**: Adjust simulation speed (1-10 seconds)

### 📊 Real-time Event Generation
- **Car Arrivals**: Randomly simulate cars parking in vacant spots
- **Car Departures**: Randomly simulate cars leaving occupied spots
- **Maintenance Events**: Occasionally set spots to maintenance mode
- **Configurable Probabilities**: Adjust arrival, departure, and maintenance rates

### 📈 Analytics Integration
- **Real-time Metrics**: Track total events, arrivals, and departures
- **Historical Logging**: Automatically log analytics data every minute
- **Firestore Integration**: All data is stored in Firebase for dashboard consumption

### 🎯 Event Logging
- **Real-time Event Log**: See all simulation events as they happen
- **Color-coded Events**: Different colors for arrivals, departures, maintenance, and system events
- **Auto-scroll**: Automatically scroll to show latest events
- **Log Management**: Clear log and limit entries to prevent memory issues

## How to Use

### 1. Setup
1. Ensure your Firebase project is properly configured in `firebase-config.js`
2. Open `simulator.html` in your web browser
3. The simulator will automatically initialize parking spots in Firestore

### 2. Configuration
- **Total Parking Spots**: Set the number of parking spots (1-100)
- **Arrival Probability**: Percentage chance of a car arriving per interval (0-100%)
- **Departure Probability**: Percentage chance of a car departing per interval (0-100%)
- **Maintenance Probability**: Percentage chance of a spot going into maintenance (0-100%)
- **Event Interval**: How often to check for events (1-10 seconds)

### 3. Running the Simulation
1. Click **"Start Simulation"** to begin generating events
2. Watch the real-time event log for activity
3. Use **"Pause Simulation"** to temporarily stop without losing state
4. Use **"Stop Simulation"** to completely stop the simulation
5. Use **"Reset All Spots"** to clear all spots to vacant status

### 4. Monitoring
- **Event Counters**: Track total events, arrivals, and departures
- **Connection Status**: Green dot indicates successful Firebase connection
- **Simulation Status**: Shows current simulation state (Running/Paused/Stopped)

## Integration with Dashboard

The simulator writes data to the same Firestore collections that the dashboard reads from:

### Collections Used
- **`parking_spots`**: Individual spot status and metadata
- **`metrics_log`**: Historical analytics data for charts and trends

### Data Structure
```javascript
// parking_spots collection
{
  id: "spot_1",
  status: false, // false = vacant, true = occupied
  maintenance: false,
  last_updated: timestamp,
  created_at: timestamp
}

// metrics_log collection
{
  timestamp: timestamp,
  total_spots: 24,
  occupied_spots: 12,
  available_spots: 10,
  maintenance_spots: 2,
  occupancy_rate: 50.0,
  events_generated: 150,
  arrivals: 75,
  departures: 75
}
```

## Testing Scenarios

### High Occupancy Testing
- Set arrival probability to 80% and departure to 20%
- Watch the system reach high occupancy rates
- Test dashboard behavior at capacity limits

### Maintenance Testing
- Increase maintenance probability to 10-15%
- Observe how maintenance spots are handled
- Test dashboard maintenance mode indicators

### Rapid Changes
- Set event interval to 1 second
- Increase both arrival and departure probabilities
- Test real-time updates and dashboard responsiveness

### Edge Cases
- Start with all spots occupied (100% capacity)
- Test arrival events when no spots are available
- Test departure events when no spots are occupied

## Troubleshooting

### Common Issues
1. **Firebase Connection Failed**: Check your Firebase configuration in `firebase-config.js`
2. **No Events Generated**: Ensure probabilities are set above 0% and spots are available
3. **Dashboard Not Updating**: Verify both simulator and dashboard are using the same Firebase project

### Debug Mode
- Open browser developer tools to see console logs
- Check Firestore console for data updates
- Monitor network tab for Firebase requests

## Architecture

The simulator follows an event-driven architecture:

1. **Initialization**: Sets up parking spots in Firestore
2. **Event Loop**: Runs at configurable intervals
3. **Probability Engine**: Determines event types based on configured probabilities
4. **Firestore Updates**: Writes changes to the database
5. **Analytics Logging**: Periodically logs metrics for historical analysis
6. **Real-time Feedback**: Updates UI with event logs and counters

This design allows for realistic testing of the parking system without physical hardware while maintaining the same data flow as the production system.
