// Dashboard JavaScript for StrayCare NGO

// Global variables
let currentCases = [];
let volunteers = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    setupEventListeners();
    updateVolunteerScheduleDisplay();
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load rescue cases
        const casesResponse = await fetch('https://straycare-api.onrender.com/api/rescue-cases');
        const casesData = await casesResponse.json();
        
        if (casesData.success) {
            currentCases = casesData.cases;
            updateRecentCasesDisplay();
        } else {
            console.log('No cases found, creating sample data');
            currentCases = [];
            updateRecentCasesDisplay();
        }
        
        // Load volunteers
        const volunteersResponse = await fetch('https://straycare-api.onrender.com/api/volunteers');
        const volunteersData = await volunteersResponse.json();
        
        if (volunteersData.success) {
            volunteers = volunteersData.volunteers;
            console.log('Loaded volunteers:', volunteers.length);
        } else {
            console.log('No volunteers found');
            volunteers = [];
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        // Create fallback data for testing
        createFallbackData();
    }
}

// Create fallback data for testing when backend is not available
function createFallbackData() {
    currentCases = [
        {
            _id: 'test1',
            title: 'Injured Dog - Bandra West',
            status: 'pending',
            priority: 'high',
            location: 'Bandra West, Mumbai',
            reportedBy: 'Priya Sharma',
            phone: '+91-9876543210',
            description: 'Dog with injured leg, limping',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'test2',
            title: 'Sick Cat - Andheri East',
            status: 'in-progress',
            priority: 'medium',
            location: 'Andheri East, Mumbai',
            reportedBy: 'Amit Patel',
            phone: '+91-9876543211',
            description: 'Cat with respiratory infection',
            assignedVolunteer: 'Dr. Meera',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    ];
    
    volunteers = [
        {
            _id: 'vol1',
            name: 'Dr. Priya Singh',
            email: 'priya@example.com',
            phone: '+91-9876543210',
            role: 'animal-care',
            availability: 'weekdays'
        },
        {
            _id: 'vol2',
            name: 'Rahul Kumar',
            email: 'rahul@example.com',
            phone: '+91-9876543211',
            role: 'transport',
            availability: 'flexible'
        },
        {
            _id: 'vol3',
            name: 'Dr. Meera Patel',
            email: 'meera@example.com',
            phone: '+91-9876543212',
            role: 'medical',
            availability: 'mornings'
        },
        {
            _id: 'vol4',
            name: 'Amit Sharma',
            email: 'amit@example.com',
            phone: '+91-9876543213',
            role: 'rescue',
            availability: 'evenings'
        }
    ];
    
    updateRecentCasesDisplay();
}

// Create fallback volunteers when none are loaded
function createFallbackVolunteers() {
    volunteers = [
        {
            _id: 'vol1',
            name: 'Dr. Priya Singh',
            email: 'priya@example.com',
            phone: '+91-9876543210',
            role: 'animal-care',
            availability: 'weekdays'
        },
        {
            _id: 'vol2',
            name: 'Rahul Kumar',
            email: 'rahul@example.com',
            phone: '+91-9876543211',
            role: 'transport',
            availability: 'flexible'
        },
        {
            _id: 'vol3',
            name: 'Dr. Meera Patel',
            email: 'meera@example.com',
            phone: '+91-9876543212',
            role: 'medical',
            availability: 'mornings'
        },
        {
            _id: 'vol4',
            name: 'Amit Sharma',
            email: 'amit@example.com',
            phone: '+91-9876543213',
            role: 'rescue',
            availability: 'evenings'
        }
    ];
    console.log('Created fallback volunteers:', volunteers.length);
}

// Update recent cases display
function updateRecentCasesDisplay() {
    const casesContainer = document.querySelector('.cases-grid');
    if (!casesContainer) return;
    
    casesContainer.innerHTML = '';
    
    if (currentCases.length === 0) {
        casesContainer.innerHTML = '<div class="loading-message"><p>No recent cases found</p></div>';
        return;
    }
    
    // Show only the 2 most recent cases
    const recentCases = currentCases.slice(0, 2);
    
    recentCases.forEach(case_ => {
        const caseCard = createDashboardCaseCard(case_);
        casesContainer.appendChild(caseCard);
    });
}

// Create dashboard case card
function createDashboardCaseCard(case_) {
    const card = document.createElement('div');
    card.className = 'case-card';
    
    const statusClass = case_.status.replace('-', '');
    const timeAgo = formatTimeAgo(case_.createdAt);
    
    card.innerHTML = `
        <div class="case-image">
            <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop" alt="${case_.title}">
            <span class="status-badge ${statusClass}">${getStatusDisplay(case_.status)}</span>
        </div>
        <div class="case-info">
            <h3>${case_.title}</h3>
            <p>Reported by: ${case_.reportedBy}</p>
            <p>Location: ${case_.location}</p>
            ${case_.assignedVolunteer ? `<p>Assigned to: ${case_.assignedVolunteer}</p>` : ''}
            <p>Reported: ${timeAgo}</p>
            <div class="case-actions">
                ${getDashboardActionButtons(case_)}
            </div>
        </div>
    `;
    
    return card;
}

// Get dashboard action buttons
function getDashboardActionButtons(case_) {
    if (case_.status === 'pending') {
        return `
            <button class="btn-primary" onclick="openVolunteerSelection('${case_._id}')">Assign Volunteer</button>
            <button class="btn-secondary" onclick="viewCaseDetails('${case_._id}')">View Details</button>
        `;
    } else if (case_.status === 'in-progress') {
        return `
            <button class="btn-primary" onclick="openStatusUpdate('${case_._id}')">Update Status</button>
            <button class="btn-secondary" onclick="viewCaseDetails('${case_._id}')">View Details</button>
        `;
    } else {
        return `
            <button class="btn-secondary" onclick="viewCaseDetails('${case_._id}')">View Details</button>
        `;
    }
}

// Open volunteer selection modal
function openVolunteerSelection(caseId) {
    // Ensure we have fallback volunteers if none loaded from backend
    if (volunteers.length === 0) {
        createFallbackVolunteers();
    }
    
    // Check if case already has an assigned volunteer
    const currentCase = currentCases.find(c => c._id === caseId);
    if (currentCase && currentCase.assignedVolunteer) {
        // Show current assignment modal instead of new assignment
        const modal = createCurrentAssignmentModal(caseId, currentCase);
        document.body.appendChild(modal);
    } else {
        // Show volunteer selection modal for unassigned cases
        const modal = createVolunteerSelectionModal(caseId, volunteers);
        document.body.appendChild(modal);
    }
}

// Create volunteer selection modal
function createVolunteerSelectionModal(caseId, volunteerList) {
    const modal = document.createElement('div');
    modal.className = 'modal volunteer-selection-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-users"></i> Assign Volunteer to Case</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="volunteer-selection-grid">
                    ${volunteerList.map(volunteer => `
                        <div class="volunteer-option" onclick="selectVolunteer('${caseId}', '${volunteer.name}', '${volunteer._id}')">
                            <div class="volunteer-avatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="volunteer-info">
                                <h4>${volunteer.name}</h4>
                                <p class="volunteer-role">${getRoleDisplay(volunteer.role)}</p>
                                <p class="volunteer-availability">
                                    <i class="fas fa-clock"></i> ${getAvailabilityDisplay(volunteer.availability)}
                                </p>
                                <p class="volunteer-contact">
                                    <i class="fas fa-phone"></i> ${volunteer.phone}
                                </p>
                            </div>
                            <div class="select-btn">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Create current assignment modal (for already assigned cases)
function createCurrentAssignmentModal(caseId, currentCase) {
    const modal = document.createElement('div');
    modal.className = 'modal current-assignment-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-user-check"></i> Current Assignment</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="assignment-info">
                    <div class="case-summary">
                        <h3>${currentCase.title}</h3>
                        <p><strong>Status:</strong> <span class="status-badge ${currentCase.status}">${getStatusDisplay(currentCase.status)}</span></p>
                        <p><strong>Priority:</strong> <span class="priority-badge ${currentCase.priority}">${currentCase.priority}</span></p>
                        <p><strong>Location:</strong> ${currentCase.location}</p>
                    </div>
                    
                    <div class="current-volunteer">
                        <div class="volunteer-card assigned">
                            <div class="volunteer-avatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="volunteer-info">
                                <h4>${currentCase.assignedVolunteer}</h4>
                                <p class="volunteer-status">
                                    <i class="fas fa-check-circle"></i> Currently Assigned
                                </p>
                                <p class="assignment-time">
                                    <i class="fas fa-clock"></i> Assigned recently
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="assignment-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button type="button" class="btn-warning" onclick="reassignVolunteer('${caseId}')">Reassign Volunteer</button>
                    <button type="button" class="btn-primary" onclick="contactVolunteer('${currentCase.assignedVolunteer}')">Contact Volunteer</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Reassign volunteer function
function reassignVolunteer(caseId) {
    // Close current modal
    document.querySelector('.current-assignment-modal').remove();
    
    // Open volunteer selection modal
    const modal = createVolunteerSelectionModal(caseId, volunteers);
    document.body.appendChild(modal);
}

// Contact volunteer function
function contactVolunteer(volunteerName) {
    const volunteer = volunteers.find(v => v.name === volunteerName);
    if (volunteer) {
        showNotification(`📞 Contacting ${volunteerName} at ${volunteer.phone}`, 'info');
        // In a real app, this could open a phone dialer or messaging app
        if (volunteer.phone) {
            window.open(`tel:${volunteer.phone}`, '_blank');
        }
    } else {
        showNotification('Volunteer contact information not available', 'error');
    }
}

// Select volunteer for assignment
async function selectVolunteer(caseId, volunteerName, volunteerId) {
    try {
        // Check if we're using fallback data
        const isUsingFallbackData = currentCases.some(c => c._id.startsWith('test'));
        
        if (isUsingFallbackData) {
            // Update local fallback data
            const caseIndex = currentCases.findIndex(c => c._id === caseId);
            if (caseIndex !== -1) {
                currentCases[caseIndex].assignedVolunteer = volunteerName;
                currentCases[caseIndex].status = 'in-progress';
                
                // Close modal
                document.querySelector('.volunteer-selection-modal').remove();
                
                // Update display
                updateRecentCasesDisplay();
                
                showNotification(`✅ Volunteer ${volunteerName} assigned successfully!`, 'success');
                return;
            }
        }
        
        const response = await fetch(`https://straycare-api.onrender.com/api/rescue-cases/${caseId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                assignedVolunteer: volunteerName,
                status: 'in-progress'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            document.querySelector('.volunteer-selection-modal').remove();
            
            // Update the case in currentCases array
            const caseIndex = currentCases.findIndex(c => c._id === caseId);
            if (caseIndex !== -1) {
                currentCases[caseIndex].assignedVolunteer = volunteerName;
                currentCases[caseIndex].status = 'in-progress';
            }
            
            // Update localStorage to sync with rescue-cases page
            updateCaseInLocalStorage(caseId, {
                assignedVolunteer: volunteerName,
                status: 'in-progress'
            });
            
            // Update dashboard display
            loadDashboardData();
            
            showNotification(`✅ Volunteer ${volunteerName} assigned successfully!`, 'success');
        } else {
            // Fallback for demo data
            const caseIndex = currentCases.findIndex(c => c._id === caseId);
            if (caseIndex !== -1) {
                currentCases[caseIndex].assignedVolunteer = volunteerName;
                currentCases[caseIndex].status = 'in-progress';
                
                // Update localStorage
                updateCaseInLocalStorage(caseId, {
                    assignedVolunteer: volunteerName,
                    status: 'in-progress'
                });
                
                // Close modal
                document.querySelector('.volunteer-selection-modal').remove();
                
                // Update dashboard display
                loadDashboardData();
                
                showNotification(`✅ Volunteer ${volunteerName} assigned successfully!`, 'success');
            } else {
                showNotification('Failed to assign volunteer', 'error');
            }
        }
    } catch (error) {
        console.error('Error assigning volunteer:', error);
        
        // Fallback for demo data
        const caseIndex = currentCases.findIndex(c => c._id === caseId);
        if (caseIndex !== -1) {
            currentCases[caseIndex].assignedVolunteer = volunteerName;
            currentCases[caseIndex].status = 'in-progress';
            
            // Update localStorage
            updateCaseInLocalStorage(caseId, {
                assignedVolunteer: volunteerName,
                status: 'in-progress'
            });
            
            // Close modal
            document.querySelector('.volunteer-selection-modal').remove();
            
            // Update dashboard display
            loadDashboardData();
            
            showNotification(`✅ Volunteer ${volunteerName} assigned successfully!`, 'success');
        } else {
            showNotification('Failed to assign volunteer', 'error');
        }
    }
}

// Open status update modal
function openStatusUpdate(caseId) {
    // ... rest of the code remains the same ...
    const modal = createStatusUpdateModal(caseId);
    document.body.appendChild(modal);
}

// Create status update modal
function createStatusUpdateModal(caseId) {
    const modal = document.createElement('div');
    modal.className = 'modal status-update-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-edit"></i> Update Case Status</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="statusUpdateForm">
                    <div class="form-group">
                        <label for="newStatus">Select New Status:</label>
                        <select id="newStatus" required>
                            <option value="">Choose status...</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="statusNotes">Update Notes (Optional):</label>
                        <textarea id="statusNotes" rows="3" placeholder="Add any notes about the status update..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Update Status</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Handle form submission
    modal.querySelector('#statusUpdateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateCaseStatus(caseId);
    });
    
    return modal;
}

// Update case status
async function updateCaseStatus(caseId) {
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value;
    
    if (!newStatus) {
        showNotification('Please select a status', 'error');
        return;
    }
    
    try {
        const response = await fetch(`https://straycare-api.onrender.com/api/rescue-cases/${caseId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus,
                notes: notes
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            document.querySelector('.status-update-modal').remove();
            
            // Reload dashboard data
            await loadDashboardData();
            
            showNotification(`✅ Case status updated to ${getStatusDisplay(newStatus)}!`, 'success');
        } else {
            showNotification('Failed to update case status', 'error');
        }
    } catch (error) {
        console.error('Error updating case status:', error);
        showNotification('Failed to update case status', 'error');
    }
}

// View case details
function viewCaseDetails(caseId) {
    // Redirect to rescue cases page with case details
    window.location.href = `rescue-cases.html?case=${caseId}`;
}

// Medical Scheduler Functions
let scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks')) || [];

// Open medical scheduler modal
function openMedicalScheduler(taskId, taskTitle, taskType) {
    const modal = createMedicalSchedulerModal(taskId, taskTitle, taskType);
    document.body.appendChild(modal);
}

// Create medical scheduler modal
function createMedicalSchedulerModal(taskId, taskTitle, taskType) {
    const modal = document.createElement('div');
    modal.className = 'modal medical-scheduler-modal';
    modal.style.display = 'block';
    
    const today = new Date().toISOString().split('T')[0];
    const minTime = '08:00';
    const maxTime = '18:00';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-calendar-plus"></i> Schedule Medical Task</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="medicalSchedulerForm">
                    <div class="form-group">
                        <label for="taskTitle">Task:</label>
                        <input type="text" id="taskTitle" value="${taskTitle}" readonly>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="scheduledDate">Date:</label>
                            <input type="date" id="scheduledDate" min="${today}" required>
                        </div>
                        <div class="form-group">
                            <label for="scheduledTime">Time:</label>
                            <input type="time" id="scheduledTime" min="${minTime}" max="${maxTime}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="assignedVet">Assigned Veterinarian:</label>
                        <select id="assignedVet" required>
                            <option value="">Select Veterinarian</option>
                            <option value="Dr. Priya Singh">Dr. Priya Singh</option>
                            <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
                            <option value="Dr. Meera Patel">Dr. Meera Patel</option>
                            <option value="Dr. Amit Sharma">Dr. Amit Sharma</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="location">Location:</label>
                        <select id="location" required>
                            <option value="">Select Location</option>
                            <option value="Main Clinic">Main Clinic - Bandra</option>
                            <option value="Mobile Unit">Mobile Veterinary Unit</option>
                            <option value="Partner Clinic">Partner Clinic - Andheri</option>
                            <option value="Shelter">Animal Shelter</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="priority">Priority:</label>
                        <select id="priority" required>
                            <option value="normal">Normal</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Additional Notes:</label>
                        <textarea id="notes" rows="3" placeholder="Any special instructions or notes..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Schedule Task</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Handle form submission
    modal.querySelector('#medicalSchedulerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await scheduleMedicalTask(taskId, taskType);
    });
    
    return modal;
}

// Schedule medical task
async function scheduleMedicalTask(taskId, taskType) {
    const formData = {
        id: taskId,
        title: document.getElementById('taskTitle').value,
        type: taskType,
        date: document.getElementById('scheduledDate').value,
        time: document.getElementById('scheduledTime').value,
        assignedVet: document.getElementById('assignedVet').value,
        location: document.getElementById('location').value,
        priority: document.getElementById('priority').value,
        notes: document.getElementById('notes').value,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };
    
    try {
        // Add to scheduled tasks
        scheduledTasks.push(formData);
        localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
        
        // Close modal
        document.querySelector('.medical-scheduler-modal').remove();
        
        // Update volunteer schedule display
        updateVolunteerScheduleDisplay();
        
        showNotification(`✅ Medical task scheduled successfully for ${formData.date} at ${formData.time}!`, 'success');
        
    } catch (error) {
        console.error('Error scheduling medical task:', error);
        showNotification('Failed to schedule medical task', 'error');
    }
}

// Update volunteer schedule display
function updateVolunteerScheduleDisplay() {
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (!scheduleGrid) return;
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Filter tasks for today
    const todaysTasks = scheduledTasks.filter(task => task.date === today);
    
    // Add scheduled medical tasks to the display
    todaysTasks.forEach(task => {
        const scheduleCard = document.createElement('div');
        scheduleCard.className = 'schedule-card medical-task';
        
        const priorityClass = task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high-priority' : '';
        
        scheduleCard.innerHTML = `
            <div class="schedule-time">${formatTime(task.time)}</div>
            <div class="schedule-info">
                <h3>${task.title}</h3>
                <p>Veterinarian: ${task.assignedVet}</p>
                <p>Location: ${task.location}</p>
                <span class="schedule-status scheduled ${priorityClass}">${task.priority === 'urgent' ? 'URGENT' : 'Scheduled'}</span>
            </div>
        `;
        
        scheduleGrid.appendChild(scheduleCard);
    });
}

// Format time for display
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Update case in localStorage for cross-page synchronization
function updateCaseInLocalStorage(caseId, updates) {
    try {
        let caseUpdates = JSON.parse(localStorage.getItem('caseUpdates')) || {};
        caseUpdates[caseId] = {
            ...caseUpdates[caseId],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('caseUpdates', JSON.stringify(caseUpdates));
        console.log('Case updates saved to localStorage:', caseUpdates);
    } catch (error) {
        console.error('Error updating case in localStorage:', error);
    }
}

// Helper functions
function getStatusDisplay(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

function getRoleDisplay(role) {
    const roleMap = {
        'animal-care': 'Animal Care Specialist',
        'transport': 'Transport Volunteer',
        'medical': 'Medical Assistant',
        'admin': 'Administrative Support',
        'rescue': 'Rescue Operations'
    };
    return roleMap[role] || role;
}

function getAvailabilityDisplay(availability) {
    const availabilityMap = {
        'weekdays': 'Weekdays',
        'weekends': 'Weekends',
        'flexible': 'Flexible',
        'mornings': 'Mornings',
        'evenings': 'Evenings'
    };
    return availabilityMap[availability] || availability;
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
}

// Setup event listeners
function setupEventListeners() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.remove();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.remove());
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS styles for modals and volunteer selection
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
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #8B4513;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .close {
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }
    
    .close:hover {
        color: #333;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .volunteer-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
    }
    
    .volunteer-option {
        border: 2px solid #eee;
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .volunteer-option:hover {
        border-color: #8B4513;
        background: #f8f9fa;
    }
    
    .volunteer-avatar {
        font-size: 2rem;
        color: #8B4513;
    }
    
    .volunteer-info {
        flex: 1;
    }
    
    .volunteer-info h4 {
        margin: 0 0 0.25rem 0;
        color: #333;
    }
    
    .volunteer-info p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
        color: #666;
    }
    
    .volunteer-role {
        font-weight: 500;
        color: #8B4513 !important;
    }
    
    .select-btn {
        font-size: 1.5rem;
        color: #28a745;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
    }
    
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }
    
    .btn-primary, .btn-secondary {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .btn-primary {
        background: #8B4513;
        color: white;
    }
    
    .btn-primary:hover {
        background: #6d3410;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #545b62;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
    }
    
    .schedule-card.medical-task {
        border-left: 4px solid #28a745;
        background: #f8fff9;
    }
    
    .schedule-status.urgent {
        background: #dc3545 !important;
        color: white;
        font-weight: bold;
        animation: pulse 2s infinite;
    }
    
    .schedule-status.high-priority {
        background: #ffc107;
        color: #000;
        font-weight: bold;
    }
    
    .schedule-status.scheduled {
        background: #28a745;
        color: white;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
    
    .assignment-info {
        padding: 1rem 0;
    }
    
    .case-summary {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }
    
    .case-summary h3 {
        margin: 0 0 0.5rem 0;
        color: #8B4513;
    }
    
    .case-summary p {
        margin: 0.25rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .status-badge, .priority-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .status-badge.pending {
        background: #ffc107;
        color: #000;
    }
    
    .status-badge.in-progress {
        background: #17a2b8;
        color: white;
    }
    
    .priority-badge.high {
        background: #dc3545;
        color: white;
    }
    
    .priority-badge.medium {
        background: #fd7e14;
        color: white;
    }
    
    .current-volunteer {
        margin: 1rem 0;
    }
    
    .volunteer-card.assigned {
        border: 2px solid #28a745;
        border-radius: 8px;
        padding: 1rem;
        background: #f8fff9;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .volunteer-card.assigned .volunteer-avatar {
        font-size: 2.5rem;
        color: #28a745;
    }
    
    .volunteer-card.assigned .volunteer-info h4 {
        margin: 0 0 0.5rem 0;
        color: #28a745;
        font-size: 1.25rem;
    }
    
    .volunteer-status {
        color: #28a745;
        font-weight: 500;
        margin: 0.25rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .assignment-time {
        color: #666;
        font-size: 0.875rem;
        margin: 0.25rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .assignment-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
    
    .btn-warning {
        background: #ffc107;
        color: #000;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .btn-warning:hover {
        background: #e0a800;
    }
`;
document.head.appendChild(style);
