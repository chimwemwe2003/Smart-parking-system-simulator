// Smart Parking Dashboard JavaScript
class ParkingDashboard {
    constructor() {
        this.parkingSpots = new Map();
        this.totalSpots = 24; // Default number of parking spots
        this.selectedSpot = null;
        this.isConnected = false;
        
        this.init();
    }

    async init() {
        try {
            this.loadThemePreference();
            await this.setupFirebaseListeners();
            this.generateParkingGrid();
            this.updateStatistics();
            this.hideLoadingOverlay();
            this.setConnectionStatus(true);
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to connect to parking system');
        }
    }

    async setupFirebaseListeners() {
        // Listen for real-time updates from Firestore
        db.collection('parking_spots').onSnapshot((snapshot) => {
            console.log('Firestore snapshot received:', snapshot.size, 'documents');
            snapshot.docChanges().forEach((change) => {
                const spotData = change.doc.data();
                const spotId = change.doc.id;
                
                console.log('Spot data for', spotId, ':', spotData);
                
                this.parkingSpots.set(spotId, {
                    id: spotData.id || spotId,
                    status: spotData.status || false,
                    lastUpdated: spotData.last_updated || new Date(),
                    duration: this.calculateDuration(spotData.last_updated),
                    maintenance: spotData.maintenance || false
                });
                
                this.updateSpotDisplay(spotId);
            });
            
            this.updateStatistics();
            this.updateLastUpdatedTime();
        }, (error) => {
            console.error('Firestore listener error:', error);
            this.setConnectionStatus(false);
        });
    }

    generateParkingGrid() {
        const grid = document.getElementById('parkingGrid');
        grid.innerHTML = '';

        for (let i = 1; i <= this.totalSpots; i++) {
            const spotId = `spot_${i}`;
            const spotElement = this.createSpotElement(spotId, i);
            grid.appendChild(spotElement);
        }
    }

    createSpotElement(spotId, spotNumber) {
        const spot = document.createElement('div');
        spot.className = 'parking-spot vacant rounded-xl p-4 text-center text-white font-medium shadow-lg';
        spot.id = spotId;
        spot.onclick = () => this.showSpotDetails(spotId);
        
        const spotData = this.parkingSpots.get(spotId);
        if (spotData) {
            this.updateSpotElement(spot, spotData);
        } else {
            // Default state for spots without data
            spot.innerHTML = `
                <div class="text-sm font-semibold text-gray-300">${spotNumber}</div>
                <div class="text-xs mt-1 text-gray-400">Available</div>
                <i class="fas fa-square text-lg mt-2 text-gray-700"></i>
            `;
        }
        
        return spot;
    }

    updateSpotElement(element, spotData) {
        const spotNumber = spotData.id.replace('spot_', '');
        
        // Update classes based on status
        element.className = 'parking-spot rounded-lg p-4 text-center text-white font-medium';
        
        if (spotData.maintenance) {
            element.classList.add('maintenance');
            element.innerHTML = `
                <div class="text-sm font-semibold text-gray-300">${spotNumber}</div>
                <div class="text-xs mt-1 text-gray-400">Maintenance</div>
                <i class="fas fa-wrench text-lg mt-2 text-gray-500"></i>
            `;
        } else if (spotData.status) {
            element.classList.add('occupied');
            element.innerHTML = `
                <div class="text-sm font-semibold text-gray-300">${spotNumber}</div>
                <div class="text-xs mt-1 text-gray-400">Occupied</div>
                <i class="fas fa-square text-lg mt-2 text-gray-600"></i>
            `;
        } else {
            element.classList.add('vacant');
            element.innerHTML = `
                <div class="text-sm font-semibold text-gray-300">${spotNumber}</div>
                <div class="text-xs mt-1 text-gray-400">Available</div>
                <i class="fas fa-square text-lg mt-2 text-gray-700"></i>
            `;
        }
    }

    updateSpotDisplay(spotId) {
        const element = document.getElementById(spotId);
        const spotData = this.parkingSpots.get(spotId);
        
        if (element && spotData) {
            this.updateSpotElement(element, spotData);
        }
    }

    updateStatistics() {
        let total = this.totalSpots;
        let occupied = 0;
        let maintenance = 0;
        
        this.parkingSpots.forEach((spot) => {
            if (spot.maintenance) {
                maintenance++;
            } else if (spot.status) {
                occupied++;
            }
        });
        
        const available = total - occupied - maintenance;
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
        
        document.getElementById('totalSpots').textContent = total;
        document.getElementById('availableSpots').textContent = available;
        document.getElementById('occupiedSpots').textContent = occupied;
        document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;
    }

    showSpotDetails(spotId) {
        const spotData = this.parkingSpots.get(spotId);
        if (!spotData) return;
        
        this.selectedSpot = spotId;
        const panel = document.getElementById('spotDetailsPanel');
        const content = document.getElementById('spotDetailsContent');
        
        const spotNumber = spotData.id.replace('spot_', '');
        const statusText = spotData.maintenance ? 'Maintenance' : 
                          spotData.status ? 'Occupied' : 'Available';
        const statusColor = spotData.maintenance ? 'text-gray-500' : 
                           spotData.status ? 'text-gray-400' : 'text-gray-300';
        
        content.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <h4 class="text-lg font-semibold text-white">Spot ${spotNumber}</h4>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColor} bg-gray-800">
                        ${statusText}
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-800/50 rounded-lg p-4">
                        <p class="text-gray-300 text-sm">Spot ID</p>
                        <p class="text-white font-medium">${spotData.id}</p>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-4">
                        <p class="text-gray-300 text-sm">Current Status</p>
                        <p class="text-white font-medium">${statusText}</p>
                    </div>
                </div>
                
                <div class="bg-gray-800/50 rounded-lg p-4">
                    <p class="text-gray-300 text-sm">Last Updated</p>
                    <p class="text-white font-medium">${this.formatTimestamp(spotData.lastUpdated)}</p>
                </div>
                
                ${spotData.status ? `
                <div class="bg-gray-800/50 rounded-lg p-4">
                    <p class="text-gray-300 text-sm">Occupied Duration</p>
                    <p class="text-white font-medium">${spotData.duration}</p>
                </div>
                ` : ''}
                
                <div class="flex space-x-3">
                    <button onclick="dashboard.toggleMaintenance('${spotId}')" 
                            class="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-wrench mr-2"></i>
                        ${spotData.maintenance ? 'End Maintenance' : 'Set Maintenance'}
                    </button>
                    <button onclick="dashboard.resetSpot('${spotId}')" 
                            class="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-refresh mr-2"></i>
                        Reset Status
                    </button>
                </div>
            </div>
        `;
        
        panel.style.display = 'block';
    }

    closeSpotDetails() {
        document.getElementById('spotDetailsPanel').style.display = 'none';
        this.selectedSpot = null;
    }

    async toggleMaintenance(spotId) {
        try {
            const spotData = this.parkingSpots.get(spotId);
            const newMaintenanceStatus = !spotData.maintenance;
            
            await db.collection('parking_spots').doc(spotId).update({
                maintenance: newMaintenanceStatus,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.showSpotDetails(spotId); // Refresh the details panel
        } catch (error) {
            console.error('Error updating maintenance status:', error);
            this.showError('Failed to update maintenance status');
        }
    }

    async resetSpot(spotId) {
        try {
            await db.collection('parking_spots').doc(spotId).update({
                status: false,
                maintenance: false,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.showSpotDetails(spotId); // Refresh the details panel
        } catch (error) {
            console.error('Error resetting spot:', error);
            this.showError('Failed to reset spot status');
        }
    }

    calculateDuration(lastUpdated) {
        if (!lastUpdated) return 'Unknown';
        
        const now = new Date();
        const updated = lastUpdated.toDate ? lastUpdated.toDate() : new Date(lastUpdated);
        const diffMs = now - updated;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
        if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
        return `${diffMins}m`;
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    }

    updateLastUpdatedTime() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
    }

    setConnectionStatus(connected) {
        this.isConnected = connected;
        const statusElement = document.getElementById('connectionStatus');
        
        if (connected) {
            statusElement.className = 'w-3 h-3 bg-gray-400 rounded-full pulse-animation';
        } else {
            statusElement.className = 'w-3 h-3 bg-gray-600 rounded-full';
        }
    }

    hideLoadingOverlay() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-gray-900 border border-gray-700 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');

        if (savedTheme === 'light') {
            body.classList.add('light-theme');
            if (themeIcon) {
                themeIcon.className = 'fas fa-sun text-yellow-400';
            }
        } else {
            body.classList.remove('light-theme');
            if (themeIcon) {
                themeIcon.className = 'fas fa-moon text-gray-300';
            }
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        const isLight = body.classList.contains('light-theme');

        if (isLight) {
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            if (themeIcon) {
                themeIcon.className = 'fas fa-moon text-gray-300';
            }
        } else {
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            if (themeIcon) {
                themeIcon.className = 'fas fa-sun text-yellow-400';
            }
        }
    }
}

// Global functions for HTML onclick handlers
function closeSpotDetails() {
    dashboard.closeSpotDetails();
}

function toggleTheme() {
    dashboard.toggleTheme();
}

function openSimulator() {
    const button = document.querySelector('.simulator-btn');
    const icon = button.querySelector('i');
    const originalIcon = icon.className;
    
    // Add loading animation
    button.classList.add('loading');
    icon.className = 'fas fa-spinner mr-2';
    
    // Add a small delay for visual feedback
    setTimeout(() => {
        try {
            // Open simulator in a new window with specific features
            const simulatorWindow = window.open(
                'simulator.html',
                'ParkingSimulator',
                'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
            );
            
            // Check if the window was successfully opened
            if (simulatorWindow) {
                // Add success animation
                button.classList.remove('loading');
                button.classList.add('pulse');
                icon.className = 'fas fa-check mr-2';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    button.classList.remove('pulse');
                    icon.className = originalIcon;
                }, 2000);
                
                // Focus the new window
                simulatorWindow.focus();
            } else {
                throw new Error('Popup blocked');
            }
        } catch (error) {
            // Handle popup blocked or other errors
            button.classList.remove('loading');
            icon.className = 'fas fa-exclamation-triangle mr-2';
            
            // Show error message
            dashboard.showError('Unable to open simulator. Please allow popups for this site.');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                icon.className = originalIcon;
            }, 3000);
        }
    }, 500);
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ParkingDashboard();
});

// Add some demo data for testing (remove in production)
function addDemoData() {
    const demoSpots = [
        { id: 'spot_1', status: true, maintenance: false },
        { id: 'spot_2', status: false, maintenance: false },
        { id: 'spot_3', status: true, maintenance: false },
        { id: 'spot_4', status: false, maintenance: true },
        { id: 'spot_5', status: true, maintenance: false },
        { id: 'spot_6', status: false, maintenance: false },
        { id: 'spot_7', status: true, maintenance: false },
        { id: 'spot_8', status: false, maintenance: false },
        { id: 'spot_9', status: true, maintenance: false },
        { id: 'spot_10', status: false, maintenance: false },
        { id: 'spot_11', status: true, maintenance: false },
        { id: 'spot_12', status: false, maintenance: false },
        { id: 'spot_13', status: true, maintenance: false },
        { id: 'spot_14', status: false, maintenance: false },
        { id: 'spot_15', status: true, maintenance: false },
        { id: 'spot_16', status: false, maintenance: false },
        { id: 'spot_17', status: true, maintenance: false },
        { id: 'spot_18', status: false, maintenance: false },
        { id: 'spot_19', status: true, maintenance: false },
        { id: 'spot_20', status: false, maintenance: false },
        { id: 'spot_21', status: true, maintenance: false },
        { id: 'spot_22', status: false, maintenance: false },
        { id: 'spot_23', status: true, maintenance: false },
        { id: 'spot_24', status: false, maintenance: false }
    ];
    
    demoSpots.forEach(async (spot) => {
        try {
            await db.collection('parking_spots').doc(spot.id).set({
                id: spot.id,
                status: spot.status,
                maintenance: spot.maintenance,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error adding demo data:', error);
        }
    });
}

// Uncomment the line below to add demo data (for testing purposes)
// addDemoData();

// Debug function to check parking spots data
function debugParkingSpots() {
    console.log('Current parking spots data:');
    console.log(dashboard.parkingSpots);
    console.log('Total spots:', dashboard.totalSpots);
}

// Function to reset all spots to vacant status
async function resetAllSpots() {
    try {
        console.log('Resetting all spots to vacant status...');
        const batch = db.batch();
        
        for (let i = 1; i <= 24; i++) {
            const spotId = `spot_${i}`;
            const spotRef = db.collection('parking_spots').doc(spotId);
            batch.update(spotRef, {
                status: false,
                maintenance: false,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        await batch.commit();
        console.log('All spots reset successfully');
        dashboard.showError('All spots have been reset to vacant status');
    } catch (error) {
        console.error('Error resetting spots:', error);
        dashboard.showError('Failed to reset spots');
    }
}
