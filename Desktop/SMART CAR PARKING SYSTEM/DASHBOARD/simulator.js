// Smart Parking System Simulator
class ParkingSimulator {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.simulationInterval = null;
        this.eventCount = 0;
        this.arrivalCount = 0;
        this.departureCount = 0;
        this.totalSpots = 24;
        this.arrivalProbability = 30; // 30% chance per interval
        this.departureProbability = 25; // 25% chance per interval
        this.maintenanceProbability = 5; // 5% chance per interval
        this.eventInterval = 2000; // 2 seconds default
        this.analyticsInterval = null;
        
        // Check if simulation was running before page load
        this.checkPreviousState();
        this.init();
        this.startClock();
    }

    checkPreviousState() {
        // Check if simulation was running in a previous session
        const wasRunning = localStorage.getItem('simulator_running') === 'true';
        const wasPaused = localStorage.getItem('simulator_paused') === 'true';
        
        if (wasRunning) {
            this.isRunning = true;
            this.isPaused = wasPaused;
            console.log('Restoring previous simulation state:', { running: wasRunning, paused: wasPaused });
        }
    }

    saveState() {
        // Save current state to localStorage
        localStorage.setItem('simulator_running', this.isRunning.toString());
        localStorage.setItem('simulator_paused', this.isPaused.toString());
        localStorage.setItem('simulator_eventCount', this.eventCount.toString());
        localStorage.setItem('simulator_arrivalCount', this.arrivalCount.toString());
        localStorage.setItem('simulator_departureCount', this.departureCount.toString());
    }

    clearState() {
        // Clear saved state
        localStorage.removeItem('simulator_running');
        localStorage.removeItem('simulator_paused');
        localStorage.removeItem('simulator_eventCount');
        localStorage.removeItem('simulator_arrivalCount');
        localStorage.removeItem('simulator_departureCount');
    }

    restorePreviousState() {
        // Restore event counts from localStorage
        const savedEventCount = localStorage.getItem('simulator_eventCount');
        const savedArrivalCount = localStorage.getItem('simulator_arrivalCount');
        const savedDepartureCount = localStorage.getItem('simulator_departureCount');
        
        if (savedEventCount) this.eventCount = parseInt(savedEventCount);
        if (savedArrivalCount) this.arrivalCount = parseInt(savedArrivalCount);
        if (savedDepartureCount) this.departureCount = parseInt(savedDepartureCount);
        
        this.updateEventCounters();
        this.updateSimulationStatus(this.isPaused ? 'paused' : 'running', this.isPaused ? 'Paused' : 'Running');
        this.updateControlButtons();
        
        // Restart the simulation if it was running
        if (this.isRunning && !this.isPaused) {
            this.startSimulation();
        }
    }

    startClock() {
        // Update clock every second
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const catTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
        const timeString = catTime.toLocaleTimeString('en-GB', {
            timeZone: 'Africa/Lubumbashi',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    async init() {
        try {
            console.log('Starting simulator initialization...');
            await this.setupEventListeners();
            console.log('Event listeners setup complete');
            await this.initializeParkingSpots();
            console.log('Parking spots initialization complete');
            this.hideLoadingOverlay();
            this.setConnectionStatus(true);
            
            // Restore previous state if it was running
            if (this.isRunning) {
                this.restorePreviousState();
                this.logEvent('Simulation restored from previous session', 'success');
            } else {
                this.logEvent('System initialized successfully', 'success');
            }
            
            console.log('Simulator initialization complete');
        } catch (error) {
            console.error('Failed to initialize simulator:', error);
            this.showError(`Failed to initialize simulator: ${error.message}`);
            this.hideLoadingOverlay();
        }
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('startSimulation').addEventListener('click', () => this.startSimulation());
        document.getElementById('stopSimulation').addEventListener('click', () => this.stopSimulation());
        document.getElementById('pauseSimulation').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('resetSimulation').addEventListener('click', () => this.resetAllSpots());
        document.getElementById('clearLog').addEventListener('click', () => this.clearEventLog());
        document.getElementById('clearCache').addEventListener('click', () => this.clearCache());
        document.getElementById('openAnalytics').addEventListener('click', () => this.openAnalytics());

        // Configuration inputs
        document.getElementById('eventInterval').addEventListener('change', (e) => {
            this.eventInterval = parseInt(e.target.value);
            if (this.isRunning && !this.isPaused) {
                this.restartSimulation();
            }
        });

        document.getElementById('totalSpots').addEventListener('change', (e) => {
            this.totalSpots = parseInt(e.target.value);
        });

        document.getElementById('arrivalProbability').addEventListener('change', (e) => {
            this.arrivalProbability = parseInt(e.target.value);
        });

        document.getElementById('departureProbability').addEventListener('change', (e) => {
            this.departureProbability = parseInt(e.target.value);
        });

        document.getElementById('maintenanceProbability').addEventListener('change', (e) => {
            this.maintenanceProbability = parseInt(e.target.value);
        });
    }

    async initializeParkingSpots() {
        try {
            console.log('Checking for existing parking spots...');
            // Check if parking spots already exist
            const snapshot = await db.collection('parking_spots').get();
            console.log(`Found ${snapshot.size} existing parking spots`);
            
            if (snapshot.empty) {
                console.log('No existing spots found, creating new ones...');
                this.logEvent('Initializing parking spots in Firestore...', 'info');
                
                // Create parking spots
                const batch = db.batch();
                for (let i = 1; i <= this.totalSpots; i++) {
                    const spotId = `spot_${i}`;
                    const spotRef = db.collection('parking_spots').doc(spotId);
                    
                    batch.set(spotRef, {
                        id: spotId,
                        status: false, // false = vacant, true = occupied
                        maintenance: false,
                        last_updated: firebase.firestore.FieldValue.serverTimestamp(),
                        created_at: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                console.log('Committing batch to Firestore...');
                await batch.commit();
                console.log('Batch committed successfully');
                this.logEvent(`Created ${this.totalSpots} parking spots`, 'success');
            } else {
                this.logEvent(`Found ${snapshot.size} existing parking spots`, 'info');
                this.totalSpots = snapshot.size;
                document.getElementById('totalSpots').value = this.totalSpots;
            }
        } catch (error) {
            console.error('Error initializing parking spots:', error);
            this.logEvent(`Failed to initialize parking spots: ${error.message}`, 'error');
            throw error;
        }
    }

    async startSimulation() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.updateSimulationStatus('running', 'Running');
        this.updateControlButtons();
        this.saveState(); // Save state to localStorage
        
        this.logEvent('Simulation started', 'success');
        
        // Start the main simulation loop
        this.simulationInterval = setInterval(() => {
            if (!this.isPaused) {
                this.generateRandomEvent();
            }
        }, this.eventInterval);

        // Start analytics logging
        this.startAnalyticsLogging();
    }

    stopSimulation() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = false;
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        if (this.analyticsInterval) {
            clearInterval(this.analyticsInterval);
            this.analyticsInterval = null;
        }

        this.updateSimulationStatus('stopped', 'Stopped');
        this.updateControlButtons();
        this.clearState(); // Clear saved state when stopped
        this.logEvent('Simulation stopped', 'info');
    }

    pauseSimulation() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;
        const status = this.isPaused ? 'paused' : 'running';
        const statusText = this.isPaused ? 'Paused' : 'Running';
        
        this.updateSimulationStatus(status, statusText);
        this.updateControlButtons();
        this.saveState(); // Save state when pausing/resuming
        
        const message = this.isPaused ? 'Simulation paused' : 'Simulation resumed';
        this.logEvent(message, 'info');
    }

    restartSimulation() {
        this.stopSimulation();
        setTimeout(() => this.startSimulation(), 100);
    }

    async generateRandomEvent() {
        try {
            // Get current parking spots status
            const snapshot = await db.collection('parking_spots').get();
            const spots = [];
            const vacantSpots = [];
            const occupiedSpots = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                spots.push({ id: doc.id, ...data });
                
                if (data.maintenance) {
                    // Skip maintenance spots for now
                } else if (data.status) {
                    occupiedSpots.push({ id: doc.id, ...data });
                } else {
                    vacantSpots.push({ id: doc.id, ...data });
                }
            });

            // Determine event type based on probabilities and current state
            const random = Math.random() * 100;
            let eventType = null;

            // Check for maintenance events first (lowest priority)
            if (random < this.maintenanceProbability && spots.length > 0) {
                eventType = 'maintenance';
            }
            // Check for departure events (if there are occupied spots)
            else if (random < this.departureProbability && occupiedSpots.length > 0) {
                eventType = 'departure';
            }
            // Check for arrival events (if there are vacant spots)
            else if (random < this.arrivalProbability && vacantSpots.length > 0) {
                eventType = 'arrival';
            }

            if (eventType) {
                await this.executeEvent(eventType, vacantSpots, occupiedSpots, spots);
            }
        } catch (error) {
            console.error('Error generating random event:', error);
            this.logEvent('Error generating event', 'error');
        }
    }

    async executeEvent(eventType, vacantSpots, occupiedSpots, allSpots) {
        let selectedSpot = null;
        let eventMessage = '';

        switch (eventType) {
            case 'arrival':
                selectedSpot = vacantSpots[Math.floor(Math.random() * vacantSpots.length)];
                await this.updateSpotStatus(selectedSpot.id, true, false);
                eventMessage = `Car arrived at Spot ${selectedSpot.id.replace('spot_', '')}`;
                this.arrivalCount++;
                break;

            case 'departure':
                selectedSpot = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)];
                await this.updateSpotStatus(selectedSpot.id, false, false);
                eventMessage = `Car departed from Spot ${selectedSpot.id.replace('spot_', '')}`;
                this.departureCount++;
                break;

            case 'maintenance':
                // Randomly select a spot for maintenance
                const availableForMaintenance = allSpots.filter(spot => !spot.maintenance);
                if (availableForMaintenance.length > 0) {
                    selectedSpot = availableForMaintenance[Math.floor(Math.random() * availableForMaintenance.length)];
                    await this.updateSpotStatus(selectedSpot.id, false, true);
                    eventMessage = `Spot ${selectedSpot.id.replace('spot_', '')} set to maintenance`;
                }
                break;
        }

        if (selectedSpot) {
            this.eventCount++;
            this.logEvent(eventMessage, 'event');
            this.updateEventCounters();
            this.saveState(); // Save state after each event
        }
    }

    async updateSpotStatus(spotId, status, maintenance) {
        try {
            await db.collection('parking_spots').doc(spotId).update({
                status: status,
                maintenance: maintenance,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating spot status:', error);
            this.logEvent(`Failed to update ${spotId}`, 'error');
        }
    }

    async resetAllSpots() {
        try {
            this.logEvent('Resetting all parking spots...', 'info');
            
            const batch = db.batch();
            const snapshot = await db.collection('parking_spots').get();
            
            snapshot.forEach(doc => {
                const spotRef = db.collection('parking_spots').doc(doc.id);
                batch.update(spotRef, {
                    status: false,
                    maintenance: false,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            this.logEvent('All parking spots reset to vacant', 'success');
        } catch (error) {
            console.error('Error resetting spots:', error);
            this.logEvent('Failed to reset parking spots', 'error');
        }
    }

    startAnalyticsLogging() {
        // Log analytics data every minute
        this.analyticsInterval = setInterval(async () => {
            await this.logAnalyticsData();
        }, 60000); // 60 seconds
    }

    async logAnalyticsData() {
        try {
            const snapshot = await db.collection('parking_spots').get();
            let total = 0;
            let occupied = 0;
            let maintenance = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                total++;
                if (data.maintenance) {
                    maintenance++;
                } else if (data.status) {
                    occupied++;
                }
            });

            const available = total - occupied - maintenance;
            const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
            const revenue = occupied * 10; // 10 ZMW per hour per occupied spot

            // Log to analytics collection
            await db.collection('metrics_log').add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                total_spots: total,
                occupied_spots: occupied,
                available_spots: available,
                maintenance_spots: maintenance,
                occupancy_rate: Math.round(occupancyRate * 100) / 100,
                revenue_zmw: revenue,
                events_generated: this.eventCount,
                arrivals: this.arrivalCount,
                departures: this.departureCount
            });

            this.logEvent(`Analytics logged: ${Math.round(occupancyRate)}% occupancy`, 'analytics');
        } catch (error) {
            console.error('Error logging analytics:', error);
        }
    }

    logEvent(message, type = 'info') {
        const logContainer = document.getElementById('eventLog');
        const timestamp = new Date().toLocaleTimeString('en-GB', {
            timeZone: 'Africa/Lubumbashi',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Remove placeholder if it exists
        const placeholder = logContainer.querySelector('.text-gray-500');
        if (placeholder) {
            placeholder.remove();
        }

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry flex items-center justify-between py-2 px-3 rounded mb-2';
        
        let bgColor = 'bg-white/5';
        let icon = 'fas fa-info-circle';
        let iconColor = 'text-blue-400';

        switch (type) {
            case 'success':
                bgColor = 'bg-green-500/20';
                icon = 'fas fa-check-circle';
                iconColor = 'text-green-400';
                break;
            case 'error':
                bgColor = 'bg-red-500/20';
                icon = 'fas fa-exclamation-circle';
                iconColor = 'text-red-400';
                break;
            case 'event':
                bgColor = 'bg-blue-500/20';
                icon = 'fas fa-car';
                iconColor = 'text-blue-400';
                break;
            case 'analytics':
                bgColor = 'bg-purple-500/20';
                icon = 'fas fa-chart-line';
                iconColor = 'text-purple-400';
                break;
        }

        logEntry.className += ` ${bgColor}`;
        logEntry.innerHTML = `
            <div class="flex items-center">
                <i class="${icon} ${iconColor} mr-3"></i>
                <span class="text-white text-sm">${message}</span>
            </div>
            <span class="text-gray-400 text-xs">${timestamp}</span>
        `;

        logContainer.insertBefore(logEntry, logContainer.firstChild);

        // Auto-scroll if enabled
        if (document.getElementById('autoScroll').checked) {
            logContainer.scrollTop = 0;
        }

        // Limit log entries to prevent memory issues
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[entries.length - 1].remove();
        }
    }

    clearEventLog() {
        const logContainer = document.getElementById('eventLog');
        logContainer.innerHTML = `
            <div class="text-blue-300 text-center py-12">
                <i class="fas fa-info-circle text-4xl mb-4"></i>
                <p class="text-lg">Event log cleared</p>
            </div>
        `;
    }

    clearCache() {
        // Clear all localStorage data
        localStorage.clear();
        
        // Clear Firebase cache
        if (db && db.clearPersistence) {
            db.clearPersistence().catch(() => {
                // Ignore errors
            });
        }
        
        // Reset simulator state
        this.eventCount = 0;
        this.arrivalCount = 0;
        this.departureCount = 0;
        this.updateEventCounters();
        
        this.logEvent('Cache cleared successfully', 'success');
        
        // Reload the page to ensure fresh start
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    openAnalytics() {
        // Open analytics in a new window
        const analyticsUrl = window.location.origin + '/analytics.html';
        const analyticsWindow = window.open(analyticsUrl, 'analytics', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        if (analyticsWindow) {
            this.logEvent('Analytics opened in new window', 'info');
        } else {
            this.logEvent('Failed to open analytics window (popup blocked?)', 'error');
        }
    }

    updateEventCounters() {
        document.getElementById('totalEvents').textContent = this.eventCount;
        document.getElementById('totalArrivals').textContent = this.arrivalCount;
        document.getElementById('totalDepartures').textContent = this.departureCount;
    }

    updateSimulationStatus(status, text) {
        const statusElement = document.getElementById('simulationStatus');
        const statusTextElement = document.getElementById('simulationStatusText');
        
        statusElement.className = 'status-indicator';
        statusElement.classList.add(`status-${status}`);
        statusTextElement.textContent = text;
    }

    updateControlButtons() {
        const startBtn = document.getElementById('startSimulation');
        const stopBtn = document.getElementById('stopSimulation');
        const pauseBtn = document.getElementById('pauseSimulation');

        if (this.isRunning) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = this.isPaused ? 
                '<i class="fas fa-play mr-2"></i>Resume Simulation' : 
                '<i class="fas fa-pause mr-2"></i>Pause Simulation';
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pause Simulation';
        }
    }

    setConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        
        if (connected) {
            statusElement.className = 'w-3 h-3 bg-green-400 rounded-full pulse-animation';
        } else {
            statusElement.className = 'w-3 h-3 bg-red-400 rounded-full';
        }
    }

    hideLoadingOverlay() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-900 border border-red-700 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize simulator when page loads
let simulator;
document.addEventListener('DOMContentLoaded', () => {
    simulator = new ParkingSimulator();
});

// Export for global access
window.simulator = simulator;
