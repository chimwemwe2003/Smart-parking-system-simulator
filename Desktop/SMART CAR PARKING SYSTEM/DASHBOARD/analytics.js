// Parking Analytics JavaScript
class ParkingAnalytics {
    constructor() {
        this.currentTimeRange = '7d';
        this.historicalData = [];
        this.charts = {};
        this.totalSpots = 24;
        
        this.init();
    }

    async init() {
        try {
            await this.loadHistoricalData();
            this.setupEventListeners();
            this.initializeCharts();
            this.updateMetrics();
            this.populateActivityTable();
            this.setupRealTimeUpdates();
            this.hideLoadingOverlay();
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
            this.showError('Failed to load analytics data');
        }
    }

    async loadHistoricalData() {
        // Start with empty data - only show data when simulator is running
        this.historicalData = [];
        
        // Try to load real data from Firebase metrics_log collection
        try {
            const snapshot = await db.collection('metrics_log').orderBy('timestamp', 'desc').limit(1000).get();
            if (!snapshot.empty) {
                this.historicalData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const timestamp = data.timestamp.toDate();
                    // Convert to Central African Time
                    const catTime = new Date(timestamp.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
                    return {
                        timestamp: catTime,
                        hour: catTime.getHours(),
                        occupancyRate: data.occupancy_rate || 0,
                        occupiedSpots: data.occupied_spots || 0,
                        availableSpots: data.available_spots || 0,
                        revenue: data.revenue_zmw || 0,
                        dayOfWeek: catTime.getDay(),
                        isWeekend: catTime.getDay() === 0 || catTime.getDay() === 6
                    };
                });
            }
        } catch (error) {
            console.log('No historical data found, starting fresh');
            this.historicalData = [];
        }
    }

    generateSampleData() {
        const data = [];
        const now = new Date();
        const days = this.getDaysForRange(this.currentTimeRange);
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Generate hourly data for each day
            for (let hour = 0; hour < 24; hour++) {
                const timestamp = new Date(date);
                timestamp.setHours(hour, 0, 0, 0);
                
                // Start from 0 occupancy and build up realistically
                const occupancyRate = this.calculateOccupancyRate(hour, i);
                const occupiedSpots = Math.round((occupancyRate / 100) * this.totalSpots);
                const revenue = occupiedSpots * 10; // 10 ZMW per hour per spot
                
                data.push({
                    timestamp: timestamp,
                    hour: hour,
                    occupancyRate: occupancyRate,
                    occupiedSpots: occupiedSpots,
                    availableSpots: this.totalSpots - occupiedSpots,
                    revenue: revenue,
                    dayOfWeek: date.getDay(),
                    isWeekend: date.getDay() === 0 || date.getDay() === 6
                });
            }
        }
        
        return data;
    }

    calculateOccupancyRate(hour, dayOffset) {
        // Start from 0 and build realistic parking patterns
        let baseRate = 0; // Start from 0 occupancy
        
        // Peak hours (8-10 AM, 5-7 PM)
        if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
            baseRate += 60; // High occupancy during peak hours
        }
        // Lunch hours (12-2 PM)
        else if (hour >= 12 && hour <= 14) {
            baseRate += 40; // Moderate occupancy during lunch
        }
        // Business hours (9 AM - 5 PM)
        else if (hour >= 9 && hour <= 17) {
            baseRate += 30; // Regular business hours
        }
        // Early morning (6-8 AM)
        else if (hour >= 6 && hour <= 8) {
            baseRate += 20; // Early morning activity
        }
        // Evening (7-10 PM)
        else if (hour >= 19 && hour <= 22) {
            baseRate += 25; // Evening activity
        }
        // Night hours (10 PM - 6 AM)
        else if (hour >= 22 || hour <= 6) {
            baseRate += 5; // Very low occupancy at night
        }
        
        // Weekend adjustment
        const date = new Date();
        date.setDate(date.getDate() - dayOffset);
        if (date.getDay() === 0 || date.getDay() === 6) {
            baseRate *= 0.6; // Lower occupancy on weekends
        }
        
        // Add some randomness
        baseRate += (Math.random() - 0.5) * 8;
        
        return Math.max(0, Math.min(100, baseRate));
    }

    getDaysForRange(range) {
        switch (range) {
            case '24h': return 1;
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            default: return 7;
        }
    }

    setupRealTimeUpdates() {
        // Listen for real-time updates from the metrics_log collection
        db.collection('metrics_log').orderBy('timestamp', 'desc').limit(1).onSnapshot((snapshot) => {
            if (!snapshot.empty) {
                const latestData = snapshot.docs[0].data();
                const timestamp = latestData.timestamp.toDate();
                // Convert to Central African Time
                const catTime = new Date(timestamp.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
                const newDataPoint = {
                    timestamp: catTime,
                    hour: catTime.getHours(),
                    occupancyRate: latestData.occupancy_rate || 0,
                    occupiedSpots: latestData.occupied_spots || 0,
                    availableSpots: latestData.available_spots || 0,
                    revenue: latestData.revenue_zmw || 0,
                    dayOfWeek: catTime.getDay(),
                    isWeekend: catTime.getDay() === 0 || catTime.getDay() === 6
                };
                
                // Add to historical data if not already present
                const exists = this.historicalData.some(d => 
                    d.timestamp.getTime() === newDataPoint.timestamp.getTime()
                );
                
                if (!exists) {
                    this.historicalData.unshift(newDataPoint);
                    // Keep only last 1000 data points
                    if (this.historicalData.length > 1000) {
                        this.historicalData = this.historicalData.slice(0, 1000);
                    }
                    
                    // Update charts and metrics
                    this.updateCharts();
                    this.updateMetrics();
                    this.updateLastUpdatedTime();
                }
            }
        }, (error) => {
            console.error('Error listening to metrics_log:', error);
        });
    }

    setupEventListeners() {
        // Time range buttons
        document.querySelectorAll('.time-range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-range-btn').forEach(b => {
                    b.classList.remove('active', 'bg-gray-700', 'text-white');
                    b.classList.add('text-gray-400');
                });
                e.target.classList.add('active', 'bg-gray-700', 'text-white');
                e.target.classList.remove('text-gray-400');
            });
        });

        // Spot filter
        document.getElementById('spotFilter').addEventListener('change', (e) => {
            this.filterActivityTable(e.target.value);
        });
    }

    setTimeRange(range) {
        this.currentTimeRange = range;
        this.loadHistoricalData();
        this.updateCharts();
        this.updateMetrics();
    }

    initializeCharts() {
        this.createOccupancyChart();
        this.createHourlyChart();
        this.createRevenueChart();
        this.createUtilizationChart();
    }

    createOccupancyChart() {
        const ctx = document.getElementById('occupancyChart').getContext('2d');
        const data = this.getOccupancyTrendData();
        
        this.charts.occupancy = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Occupancy Rate',
                    data: data.values,
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#1a1a1a'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: '#1a1a1a'
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createHourlyChart() {
        const ctx = document.getElementById('hourlyChart').getContext('2d');
        const data = this.getHourlyDistributionData();
        
        this.charts.hourly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Average Occupancy',
                    data: data.values,
                    backgroundColor: '#374151',
                    borderColor: '#4b5563',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#1a1a1a'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: '#1a1a1a'
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        const data = this.getRevenueData();
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Daily Revenue',
                    data: data.values,
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#1a1a1a'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: '#1a1a1a'
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return value + ' ZMW';
                            }
                        }
                    }
                }
            }
        });
    }

    createUtilizationChart() {
        const ctx = document.getElementById('utilizationChart').getContext('2d');
        const data = this.getUtilizationData();
        
        this.charts.utilization = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Utilization', 'Medium Utilization', 'Low Utilization'],
                datasets: [{
                    data: data.values,
                    backgroundColor: ['#374151', '#4b5563', '#6b7280'],
                    borderColor: '#1a1a1a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9ca3af',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    getOccupancyTrendData() {
        const filteredData = this.getFilteredData();
        const labels = [];
        const values = [];
        
        if (filteredData.length === 0) {
            // Return empty data if no historical data
            return { labels: ['No Data'], values: [0] };
        }
        
        if (this.currentTimeRange === '24h') {
            // Hourly data for last 24 hours in Central African Time
            for (let i = 23; i >= 0; i--) {
                const hour = new Date();
                hour.setHours(hour.getHours() - i);
                // Convert to Central African Time
                const catHour = new Date(hour.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
                labels.push(catHour.getHours() + ':00');
                
                const hourData = filteredData.filter(d => 
                    d.timestamp.getHours() === hour.getHours() && 
                    d.timestamp.getDate() === hour.getDate()
                );
                const avgOccupancy = hourData.length > 0 ? 
                    hourData.reduce((sum, d) => sum + d.occupancyRate, 0) / hourData.length : 0;
                values.push(Math.round(avgOccupancy));
            }
        } else {
            // Daily data in Central African Time
            const days = this.getDaysForRange(this.currentTimeRange);
            for (let i = days; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                // Convert to Central African Time
                const catDate = new Date(date.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
                labels.push(catDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                
                const dayData = filteredData.filter(d => 
                    d.timestamp.getDate() === date.getDate() &&
                    d.timestamp.getMonth() === date.getMonth()
                );
                const avgOccupancy = dayData.length > 0 ? 
                    dayData.reduce((sum, d) => sum + d.occupancyRate, 0) / dayData.length : 0;
                values.push(Math.round(avgOccupancy));
            }
        }
        
        return { labels, values };
    }

    getHourlyDistributionData() {
        const filteredData = this.getFilteredData();
        const labels = [];
        const values = [];
        
        for (let hour = 0; hour < 24; hour++) {
            labels.push(hour + ':00');
            const hourData = filteredData.filter(d => d.hour === hour);
            const avgOccupancy = hourData.length > 0 ? 
                hourData.reduce((sum, d) => sum + d.occupancyRate, 0) / hourData.length : 0;
            values.push(Math.round(avgOccupancy));
        }
        
        return { labels, values };
    }

    getRevenueData() {
        const filteredData = this.getFilteredData();
        const labels = [];
        const values = [];
        
        const days = this.getDaysForRange(this.currentTimeRange);
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            // Convert to Central African Time
            const catDate = new Date(date.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
            labels.push(catDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const dayData = filteredData.filter(d => 
                d.timestamp.getDate() === date.getDate() &&
                d.timestamp.getMonth() === date.getMonth()
            );
            const totalRevenue = dayData.reduce((sum, d) => sum + d.revenue, 0);
            values.push(Math.round(totalRevenue));
        }
        
        return { labels, values };
    }

    getUtilizationData() {
        const filteredData = this.getFilteredData();
        let high = 0, medium = 0, low = 0;
        
        filteredData.forEach(d => {
            if (d.occupancyRate >= 80) high++;
            else if (d.occupancyRate >= 50) medium++;
            else low++;
        });
        
        return {
            values: [high, medium, low],
            labels: ['High (80%+)', 'Medium (50-79%)', 'Low (<50%)']
        };
    }

    getFilteredData() {
        const days = this.getDaysForRange(this.currentTimeRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.historicalData.filter(d => d.timestamp >= cutoffDate);
    }

    updateCharts() {
        if (this.charts.occupancy) {
            const occupancyData = this.getOccupancyTrendData();
            this.charts.occupancy.data.labels = occupancyData.labels;
            this.charts.occupancy.data.datasets[0].data = occupancyData.values;
            this.charts.occupancy.update();
        }
        
        if (this.charts.hourly) {
            const hourlyData = this.getHourlyDistributionData();
            this.charts.hourly.data.labels = hourlyData.labels;
            this.charts.hourly.data.datasets[0].data = hourlyData.values;
            this.charts.hourly.update();
        }
        
        if (this.charts.revenue) {
            const revenueData = this.getRevenueData();
            this.charts.revenue.data.labels = revenueData.labels;
            this.charts.revenue.data.datasets[0].data = revenueData.values;
            this.charts.revenue.update();
        }
        
        if (this.charts.utilization) {
            const utilizationData = this.getUtilizationData();
            this.charts.utilization.data.datasets[0].data = utilizationData.values;
            this.charts.utilization.update();
        }
    }

    updateMetrics() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            // Show 0 when no data
            document.getElementById('peakOccupancy').textContent = '0%';
            document.getElementById('avgOccupancy').textContent = '0%';
            document.getElementById('totalRevenue').textContent = '0 ZMW';
            document.getElementById('utilizationRate').textContent = '0%';
            return;
        }
        
        // Peak Occupancy
        const peakOccupancy = Math.max(...filteredData.map(d => d.occupancyRate));
        document.getElementById('peakOccupancy').textContent = Math.round(peakOccupancy) + '%';
        
        // Average Occupancy
        const avgOccupancy = filteredData.reduce((sum, d) => sum + d.occupancyRate, 0) / filteredData.length;
        document.getElementById('avgOccupancy').textContent = Math.round(avgOccupancy) + '%';
        
        // Total Revenue
        const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
        document.getElementById('totalRevenue').textContent = Math.round(totalRevenue) + ' ZMW';
        
        // Utilization Rate (same as average occupancy for this demo)
        document.getElementById('utilizationRate').textContent = Math.round(avgOccupancy) + '%';
    }

    populateActivityTable() {
        const tableBody = document.getElementById('activityTable');
        const spotFilter = document.getElementById('spotFilter');
        
        // Populate spot filter
        spotFilter.innerHTML = '<option value="all">All Spots</option>';
        for (let i = 1; i <= this.totalSpots; i++) {
            spotFilter.innerHTML += `<option value="spot_${i}">Spot ${i}</option>`;
        }
        
        // Generate sample activity data
        const activities = this.generateActivityData();
        this.displayActivityTable(activities);
    }

    generateActivityData() {
        const activities = [];
        const now = new Date();
        
        for (let i = 1; i <= this.totalSpots; i++) {
            const spotId = `spot_${i}`;
            const status = Math.random() > 0.5 ? 'Occupied' : 'Available';
            const lastUpdated = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
            // Convert to Central African Time for display
            const catLastUpdated = new Date(lastUpdated.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
            const duration = status === 'Occupied' ? 
                Math.floor(Math.random() * 8) + 1 + 'h ' + Math.floor(Math.random() * 60) + 'm' : 
                'N/A';
            const revenue = status === 'Occupied' ? 
                (Math.random() * 80 + 20).toFixed(0) + ' ZMW' : '0 ZMW';
            
            activities.push({
                spotId: spotId,
                status: status,
                duration: duration,
                lastUpdated: catLastUpdated,
                revenue: revenue
            });
        }
        
        return activities.sort((a, b) => b.lastUpdated - a.lastUpdated);
    }

    displayActivityTable(activities) {
        const tableBody = document.getElementById('activityTable');
        tableBody.innerHTML = '';
        
        activities.forEach(activity => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-700 hover:bg-gray-800/50';
            row.innerHTML = `
                <td class="py-3 px-4 text-white">${activity.spotId}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded text-xs font-medium ${
                        activity.status === 'Occupied' ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-400'
                    }">
                        ${activity.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-gray-300">${activity.duration}</td>
                <td class="py-3 px-4 text-gray-300">${activity.lastUpdated.toLocaleString('en-GB', {
                    timeZone: 'Africa/Lubumbashi',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                })}</td>
                <td class="py-3 px-4 text-gray-300">${activity.revenue}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    filterActivityTable(spotId) {
        // This would filter the activity table based on selected spot
        // For now, just refresh the table
        const activities = this.generateActivityData();
        if (spotId !== 'all') {
            const filtered = activities.filter(a => a.spotId === spotId);
            this.displayActivityTable(filtered);
        } else {
            this.displayActivityTable(activities);
        }
    }

    exportData() {
        const data = this.getFilteredData();
        const csvContent = this.convertToCSV(data);
        this.downloadCSV(csvContent, `parking-analytics-${this.currentTimeRange}.csv`);
    }

    convertToCSV(data) {
        const headers = ['Timestamp', 'Hour', 'Occupancy Rate', 'Occupied Spots', 'Available Spots', 'Revenue'];
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = [
                row.timestamp.toISOString(),
                row.hour,
                row.occupancyRate,
                row.occupiedSpots,
                row.availableSpots,
                row.revenue
            ];
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    updateLastUpdatedTime() {
        const now = new Date();
        const catTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Lubumbashi"}));
        const timeString = catTime.toLocaleTimeString('en-GB', {
            timeZone: 'Africa/Lubumbashi',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('lastUpdated').textContent = timeString;
    }

    hideLoadingOverlay() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-gray-900 border border-gray-700 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize analytics when page loads
let analytics;
document.addEventListener('DOMContentLoaded', () => {
    analytics = new ParkingAnalytics();
});

