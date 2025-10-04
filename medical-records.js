// Medical Records Management JavaScript

// Modal functionality
function openNewRecordModal() {
    const modal = document.getElementById('newRecordModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeNewRecordModal() {
    const modal = document.getElementById('newRecordModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('newRecordModal');
    if (event.target === modal) {
        closeNewRecordModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeNewRecordModal();
    }
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const tableRows = document.querySelectorAll('.medical-records-table tbody tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Filter functionality
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const vaccinationFilter = document.getElementById('vaccinationFilter').value;
    const sterilizationFilter = document.getElementById('sterilizationFilter').value;
    
    const tableRows = document.querySelectorAll('.medical-records-table tbody tr');
    
    tableRows.forEach(row => {
        let showRow = true;
        
        // Status filter
        if (statusFilter && !row.querySelector('.status-badge').classList.contains(statusFilter)) {
            showRow = false;
        }
        
        // Vaccination filter
        if (vaccinationFilter) {
            const dueDate = row.querySelector('.due-date');
            if (vaccinationFilter === 'due' && !dueDate.classList.contains('warning')) {
                showRow = false;
            } else if (vaccinationFilter === 'overdue' && !dueDate.classList.contains('overdue')) {
                showRow = false;
            } else if (vaccinationFilter === 'up-to-date' && !dueDate.classList.contains('normal')) {
                showRow = false;
            }
        }
        
        // Sterilization filter
        if (sterilizationFilter) {
            const sterilizationStatus = row.querySelector('td:nth-child(8) .status-badge');
            if (!sterilizationStatus.classList.contains(sterilizationFilter.replace('-', ''))) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// Add event listeners to filters
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('vaccinationFilter').addEventListener('change', applyFilters);
document.getElementById('sterilizationFilter').addEventListener('change', applyFilters);

// Form submission
document.querySelector('.medical-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        animalName: document.getElementById('animalName').value,
        animalId: generateAnimalId(),
        breed: document.getElementById('animalBreed').value,
        age: document.getElementById('animalAge').value,
        healthStatus: document.getElementById('animalStatus').value,
        lastVaccination: document.getElementById('lastVaccination').value || null,
        vaccinationType: document.getElementById('vaccinationType').value || null,
        nextVaccinationDue: calculateNextVaccinationDate(document.getElementById('lastVaccination').value),
        sterilizationStatus: document.getElementById('sterilizationStatus').value,
        sterilizationDate: document.getElementById('sterilizationDate').value || null,
        medicalNotes: document.getElementById('medicalNotes').value
    };
    
    try {
        const response = await fetch('/api/medical-records', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showNotification('Medical record added successfully!', 'success');
            
            // Close modal and reset form
            closeNewRecordModal();
            this.reset();
            
            // Reload the page to show updated records
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showNotification('Failed to create medical record: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error creating medical record:', error);
        showNotification('Failed to create medical record. Please try again.', 'error');
    }
});

// Generate unique animal ID
function generateAnimalId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `ANM-${timestamp}-${randomStr}`.toUpperCase();
}

// Calculate next vaccination date (6 months from last vaccination)
function calculateNextVaccinationDate(lastVaccinationDate) {
    if (!lastVaccinationDate) return null;
    
    const lastDate = new Date(lastVaccinationDate);
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 6);
    
    return nextDate;
}

// View record functionality
function viewRecord(animalId) {
    // Here you would typically fetch the full record details
    console.log('Viewing record for animal:', animalId);
    showNotification(`Viewing details for animal ${animalId}`, 'info');
}

// Edit record functionality
function editRecord(animalId) {
    // Here you would typically populate the form with existing data
    console.log('Editing record for animal:', animalId);
    showNotification(`Editing record for animal ${animalId}`, 'info');
    openNewRecordModal();
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        case 'error': return 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
        case 'warning': return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
        default: return 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)';
    }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-icon {
        font-size: 1.2rem;
    }
    
    .notification-message {
        flex: 1;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Export functionality
document.querySelector('.btn-secondary').addEventListener('click', function() {
    // Here you would typically generate and download a CSV/PDF report
    console.log('Exporting medical records...');
    showNotification('Exporting medical records...', 'info');
    
    // Simulate export delay
    setTimeout(() => {
        showNotification('Medical records exported successfully!', 'success');
    }, 2000);
});

// Reminder card actions
document.querySelectorAll('.reminder-card button').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.reminder-card');
        const title = card.querySelector('h3').textContent;
        
        if (this.textContent.includes('Schedule')) {
            showNotification(`Scheduling appointment for ${title}`, 'info');
        } else {
            showNotification(`Viewing details for ${title}`, 'info');
        }
    });
});

// Load medical records from backend
async function loadMedicalRecords() {
    try {
        const response = await fetch('/api/medical-records');
        const data = await response.json();
        
        if (data.success) {
            updateMedicalRecordsTable(data.records);
            updateMedicalStats(data.records);
        } else {
            showNotification('Failed to load medical records', 'error');
        }
    } catch (error) {
        console.error('Error loading medical records:', error);
        showNotification('Failed to load medical records from server', 'error');
    }
}

// Update medical records table
function updateMedicalRecordsTable(records) {
    const tbody = document.querySelector('.medical-records-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.animalId}</td>
            <td>${record.animalName}</td>
            <td>${record.breed}</td>
            <td>${record.age}</td>
            <td><span class="status-badge ${record.healthStatus}">${getHealthStatusDisplay(record.healthStatus)}</span></td>
            <td>${formatDate(record.lastVaccination) || 'Not recorded'}</td>
            <td class="due-date ${getVaccinationStatus(record.nextVaccinationDue)}">${formatDate(record.nextVaccinationDue) || 'Not scheduled'}</td>
            <td><span class="status-badge ${record.sterilizationStatus.replace('-', '')}">${getSterilizationDisplay(record.sterilizationStatus)}</span></td>
            <td>
                <button class="btn-sm btn-primary" onclick="viewRecord('${record._id}')">View</button>
                <button class="btn-sm btn-secondary" onclick="editRecord('${record._id}')">Edit</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update medical statistics
function updateMedicalStats(records) {
    const totalAnimals = records.length;
    const healthyAnimals = records.filter(r => r.healthStatus === 'healthy').length;
    const underTreatment = records.filter(r => r.healthStatus === 'under-treatment').length;
    const criticalAnimals = records.filter(r => r.healthStatus === 'critical').length;
    
    // Update stat cards if they exist
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards.length >= 4) {
        statCards[0].textContent = totalAnimals;
        statCards[1].textContent = healthyAnimals;
        statCards[2].textContent = underTreatment;
        statCards[3].textContent = criticalAnimals;
    }
}

// Helper functions
function getHealthStatusDisplay(status) {
    const statusMap = {
        'healthy': 'Healthy',
        'under-treatment': 'Under Treatment',
        'recovered': 'Recovered',
        'critical': 'Critical'
    };
    return statusMap[status] || status;
}

function getSterilizationDisplay(status) {
    const statusMap = {
        'done': 'Done',
        'scheduled': 'Scheduled',
        'not-done': 'Not Done'
    };
    return statusMap[status] || status;
}

function getVaccinationStatus(nextVaccinationDate) {
    if (!nextVaccinationDate) return 'normal';
    
    const now = new Date();
    const dueDate = new Date(nextVaccinationDate);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 30) return 'warning';
    return 'normal';
}

function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Load medical records from backend
    loadMedicalRecords();
    
    // Add loading animation to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
    
    console.log('Medical Records page loaded successfully');
});

// Add fade-in animation for stat cards
const statStyle = document.createElement('style');
statStyle.textContent = `
    .stat-card.fade-in-up {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(statStyle);
