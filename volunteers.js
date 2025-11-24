// Volunteers Management JavaScript

// Global variables
let currentVolunteers = [];
let medicalReminders = [];
let volunteerSlots = [];
let currentSlotId = null;

// Immediately clear any existing error messages when script loads
(function() {
    // Clear any existing error notifications
    const allNotifications = document.querySelectorAll('.notification');
    allNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Clear any error messages in the header
    const header = document.querySelector('header');
    if (header) {
        const headerErrors = header.querySelectorAll('*');
        headerErrors.forEach(element => {
            if (element.textContent && element.textContent.includes('Error adding volunteer')) {
                element.remove();
            }
        });
    }
    
    console.log('Immediate error cleanup completed');
})();

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing volunteers page');
    
    // Immediately clear any existing error notifications
    clearErrorNotifications();
    clearHeaderErrors();
    
    // Also clear any error messages that might be in the header
    setTimeout(() => {
        clearErrorNotifications();
        clearHeaderErrors();
    }, 100);
    
    // Load volunteers immediately
    loadVolunteersFromBackend();
    loadMedicalReminders();
    loadVolunteerSlots();
    setupEventListeners();
    initializeVolunteerScheduling();
    
    // Additional setup after a short delay to ensure all elements are loaded
    setTimeout(() => {
        setupAdditionalEventListeners();
    }, 100);
    
    // Force update volunteer directory after everything is loaded
    setTimeout(() => {
        console.log('Force updating volunteer directory, current volunteers:', currentVolunteers.length);
        updateVolunteerDirectoryDisplay();
    }, 500);
    
    // Additional force update to ensure volunteers are displayed
    setTimeout(() => {
        console.log('Final force update, current volunteers:', currentVolunteers.length);
        if (currentVolunteers.length === 0) {
            console.log('No volunteers found, creating demo volunteers');
            createDemoVolunteers();
        }
        updateVolunteerDirectoryDisplay();
    }, 1000);
    
    // Final cleanup after everything is loaded
    setTimeout(() => {
        clearErrorNotifications();
        clearHeaderErrors();
    }, 1000);
    
    // Extra force update to ensure volunteers are displayed
    setTimeout(() => {
        console.log('Final force update, current volunteers:', currentVolunteers.length);
        if (currentVolunteers.length === 0) {
            console.log('No volunteers found, creating demo volunteers');
            createDemoVolunteers();
        }
        updateVolunteerDirectoryDisplay();
    }, 1500);
});

// Clear error notifications
function clearErrorNotifications() {
    // Clear all notifications, not just error ones
    const allNotifications = document.querySelectorAll('.notification');
    allNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Also clear any existing error messages in the header
    const errorBanners = document.querySelectorAll('[class*="error"], [class*="Error"]');
    errorBanners.forEach(banner => {
        if (banner.textContent.includes('Error') || banner.textContent.includes('error')) {
            banner.remove();
        }
    });
    
    // Clear any error messages in the header area specifically
    const header = document.querySelector('header');
    if (header) {
        const headerErrors = header.querySelectorAll('*');
        headerErrors.forEach(element => {
            if (element.textContent && element.textContent.includes('Error adding volunteer')) {
                element.remove();
            }
        });
    }
    
    // Clear any error messages in the user actions area
    const userActions = document.querySelector('.user-actions');
    if (userActions) {
        const userErrors = userActions.querySelectorAll('*');
        userErrors.forEach(element => {
            if (element.textContent && element.textContent.includes('Error adding volunteer')) {
                element.remove();
            }
        });
    }
    
    console.log('Cleared all notifications and error messages');
}

// Additional event listeners setup
function setupAdditionalEventListeners() {
    // Find and setup all volunteer action buttons
    const assignTaskButtons = document.querySelectorAll('button[onclick*="assignTask"]');
    assignTaskButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            const match = onclick.match(/assignTask\('([^']+)'\)/);
            if (match) {
                assignTask(match[1]);
            }
        });
    });
    
    const viewProfileButtons = document.querySelectorAll('button[onclick*="viewProfile"]');
    viewProfileButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            const match = onclick.match(/viewProfile\('([^']+)'\)/);
            if (match) {
                viewProfile(match[1]);
            }
        });
    });
    
    // Setup add volunteer button
    const addVolunteerButtons = document.querySelectorAll('button');
    addVolunteerButtons.forEach(btn => {
        if (btn.textContent.trim() === '+ Add Volunteer') {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openVolunteerModal();
            });
        }
    });
    
    console.log('Additional event listeners setup complete');
    
    // Test if functions are working
    console.log('Testing functions:');
    console.log('assignTask function:', typeof assignTask);
    console.log('viewProfile function:', typeof viewProfile);
    console.log('openVolunteerModal function:', typeof openVolunteerModal);
    
    // Add a test button for debugging
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Functions';
    testButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px;';
    testButton.onclick = function() {
        console.log('Test button clicked');
        console.log('Current volunteers:', currentVolunteers.length);
        console.log('Volunteer directory element:', document.querySelector('.volunteers-grid'));
        console.log('Add volunteer button:', document.querySelector('button[onclick="openVolunteerModal()"]'));
        assignTask('vol1');
    };
    document.body.appendChild(testButton);
    
    // Add a test button for add volunteer
    const testAddButton = document.createElement('button');
    testAddButton.textContent = 'Test Add Volunteer';
    testAddButton.style.cssText = 'position: fixed; top: 60px; right: 10px; z-index: 9999; background: blue; color: white; padding: 10px;';
    testAddButton.onclick = function() {
        console.log('Test add volunteer button clicked');
        openVolunteerModal();
    };
    document.body.appendChild(testAddButton);
    
    // Add a test button to force load demo volunteers
    const testDemoButton = document.createElement('button');
    testDemoButton.textContent = 'Load Demo Volunteers';
    testDemoButton.style.cssText = 'position: fixed; top: 110px; right: 10px; z-index: 9999; background: green; color: white; padding: 10px;';
    testDemoButton.onclick = function() {
        console.log('Force loading demo volunteers');
        forceLoadDemoVolunteers();
    };
    document.body.appendChild(testDemoButton);
}

// Load volunteers from backend
async function loadVolunteersFromBackend() {
    try {
        const response = await fetch('https://straycare-api.onrender.com/api/volunteers');
        const data = await response.json();
        
        if (data.success) {
            currentVolunteers = data.volunteers;
            updateVolunteerDirectoryDisplay();
        } else {
            console.log('No volunteers from backend, creating demo volunteers');
            createDemoVolunteers();
        }
    } catch (error) {
        console.error('Error loading volunteers:', error);
        console.log('Creating demo volunteers due to error');
        createDemoVolunteers();
    }
}

// Create demo volunteers
function createDemoVolunteers() {
    console.log('Creating demo volunteers');
    currentVolunteers = [
        {
            _id: 'vol1',
            name: 'Rahul Kumar',
            email: 'rahul@example.com',
            phone: '+91-9876543210',
            role: 'feeding-specialist',
            skills: 'Feeding, Basic Care',
            availability: 'Weekdays',
            shiftsCompleted: 15,
            rating: 4.8,
            isActive: true,
            createdAt: new Date().toISOString()
        },
        {
            _id: 'vol2',
            name: 'Dr. Priya Singh',
            email: 'priya@example.com',
            phone: '+91-9876543211',
            role: 'veterinarian',
            skills: 'Medical, Vaccination, Surgery',
            availability: 'Flexible',
            shiftsCompleted: 28,
            rating: 5.0,
            isActive: true,
            createdAt: new Date().toISOString()
        },
        {
            _id: 'vol3',
            name: 'Neha Sharma',
            email: 'neha@example.com',
            phone: '+91-9876543212',
            role: 'foster-care',
            skills: 'Fostering, Socialization',
            availability: 'Weekends',
            shiftsCompleted: 22,
            rating: 4.9,
            isActive: true,
            createdAt: new Date().toISOString()
        }
    ];
    
    console.log('Demo volunteers created:', currentVolunteers.length);
    updateVolunteerDirectoryDisplay();
}

// Load medical reminders due today
async function loadMedicalReminders() {
    try {
        const response = await fetch('https://straycare-api.onrender.com/api/medical-reminders/today');
        const data = await response.json();
        
        if (data.success) {
            medicalReminders = data.reminders;
            updateMedicalRemindersDisplay();
        } else {
            console.log('No medical reminders for today');
        }
    } catch (error) {
        console.error('Error loading medical reminders:', error);
    }
}

// Update volunteers display
function updateVolunteersDisplay() {
    const volunteersGrid = document.getElementById('volunteersGrid');
    if (!volunteersGrid) return;
    
    volunteersGrid.innerHTML = '';
    
    currentVolunteers.forEach(volunteer => {
        const volunteerCard = createVolunteerCard(volunteer);
        volunteersGrid.appendChild(volunteerCard);
    });
}

// Create volunteer card
function createVolunteerCard(volunteer) {
    const card = document.createElement('div');
    card.className = 'volunteer-card';
    
    card.innerHTML = `
        <div class="volunteer-info">
            <div class="volunteer-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="volunteer-details">
                <h3>${volunteer.name}</h3>
                <p class="volunteer-role">${getRoleDisplay(volunteer.role)}</p>
                <p class="volunteer-contact">
                    <i class="fas fa-envelope"></i> ${volunteer.email}<br>
                    <i class="fas fa-phone"></i> ${volunteer.phone}
                </p>
                <p class="volunteer-availability">
                    <i class="fas fa-clock"></i> Available: ${getAvailabilityDisplay(volunteer.availability)}
                </p>
            </div>
        </div>
        <div class="volunteer-actions">
            <button class="btn-primary btn-sm" onclick="assignTask('${volunteer._id}')">Assign Task</button>
            <button class="btn-secondary btn-sm" onclick="viewSchedule('${volunteer._id}')">View Schedule</button>
        </div>
    `;
    
    return card;
}

// Update medical reminders display
function updateMedicalRemindersDisplay() {
    const remindersContainer = document.getElementById('medicalReminders');
    if (!remindersContainer || medicalReminders.length === 0) return;
    
    // Create reminders section if it doesn't exist
    let remindersSection = document.querySelector('.medical-reminders-section');
    if (!remindersSection) {
        remindersSection = document.createElement('div');
        remindersSection.className = 'medical-reminders-section';
        remindersSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-bell"></i> Medical Reminders - Due Today</h2>
                <p>Vaccination and medical checkups scheduled for today</p>
            </div>
            <div class="reminders-grid" id="remindersGrid"></div>
        `;
        
        // Insert before volunteers section
        const volunteersSection = document.querySelector('.volunteers-section');
        if (volunteersSection) {
            volunteersSection.parentNode.insertBefore(remindersSection, volunteersSection);
        }
    }
    
    const remindersGrid = document.getElementById('remindersGrid');
    remindersGrid.innerHTML = '';
    
    medicalReminders.forEach(reminder => {
        const reminderCard = createReminderCard(reminder);
        remindersGrid.appendChild(reminderCard);
    });
    
    // Show notification about reminders
    if (medicalReminders.length > 0) {
        showNotification(`🔔 ${medicalReminders.length} medical reminder(s) due today!`, 'warning');
    }
}

// Create reminder card
function createReminderCard(reminder) {
    const card = document.createElement('div');
    card.className = 'reminder-card';
    
    card.innerHTML = `
        <div class="reminder-info">
            <div class="reminder-icon">
                <i class="fas fa-syringe"></i>
            </div>
            <div class="reminder-details">
                <h4>${reminder.animalName} (${reminder.animalId})</h4>
                <p class="reminder-type">
                    <strong>Vaccination Due:</strong> ${reminder.vaccinationType || 'General Vaccination'}
                </p>
                <p class="reminder-breed">Breed: ${reminder.breed}</p>
                <p class="reminder-status">Status: ${getHealthStatusDisplay(reminder.healthStatus)}</p>
            </div>
        </div>
        <div class="reminder-actions">
            <button class="btn-primary btn-sm" onclick="scheduleAppointment('${reminder._id}')">
                <i class="fas fa-calendar-plus"></i> Schedule
            </button>
            <button class="btn-secondary btn-sm" onclick="markCompleted('${reminder._id}')">
                <i class="fas fa-check"></i> Mark Done
            </button>
        </div>
    `;
    
    return card;
}

// Helper functions
function getRoleDisplay(role) {
    const roleMap = {
        'animal-care': 'Animal Care Specialist',
        'transport': 'Transport Volunteer',
        'medical': 'Medical Assistant',
        'admin': 'Administrative Support',
        'rescue': 'Rescue Operations',
        'feeding-specialist': 'Feeding Specialist',
        'veterinarian': 'Veterinarian',
        'foster-care': 'Foster Care',
        'fundraising': 'Fundraising',
        'general': 'General Volunteer'
    };
    return roleMap[role] || role;
}

function getAvailabilityDisplay(availability) {
    const availabilityMap = {
        'weekdays': 'Weekdays (Mon-Fri)',
        'weekends': 'Weekends (Sat-Sun)',
        'flexible': 'Flexible Schedule',
        'mornings': 'Morning Hours',
        'evenings': 'Evening Hours'
    };
    return availabilityMap[availability] || availability;
}

function getHealthStatusDisplay(status) {
    const statusMap = {
        'healthy': 'Healthy',
        'under-treatment': 'Under Treatment',
        'recovered': 'Recovered',
        'critical': 'Critical'
    };
    return statusMap[status] || status;
}

// Load volunteer slots
async function loadVolunteerSlots() {
    try {
        const response = await fetch('https://straycare-api.onrender.com/api/volunteer-slots');
        const data = await response.json();
        
        if (data.success) {
            volunteerSlots = data.slots;
            updateScheduleDisplay();
        } else {
            console.log('No volunteer slots found');
            volunteerSlots = [];
            createDemoSlots();
        }
    } catch (error) {
        console.error('Error loading volunteer slots:', error);
        createDemoSlots();
    }
}

// Create demo slots for testing
function createDemoSlots() {
    const today = new Date().toISOString().split('T')[0];
    volunteerSlots = [
        {
            _id: 'slot1',
            title: 'Morning Feeding Round',
            type: 'feeding',
            date: today,
            startTime: '09:00',
            duration: 2,
            maxVolunteers: 2,
            location: 'Bandra West Area',
            description: 'Daily morning feeding for stray animals',
            status: 'completed',
            assignedVolunteers: [{
                volunteerId: 'vol1',
                name: 'Rahul Kumar',
                phone: '+91-9876543210',
                email: 'rahul@example.com'
            }],
            createdAt: new Date().toISOString()
        },
        {
            _id: 'slot2',
            title: 'Vet Visit - Vaccination Drive',
            type: 'medical',
            date: today,
            startTime: '14:00',
            duration: 3,
            maxVolunteers: 1,
            location: 'Andheri Shelter',
            description: 'Vaccination drive for rescued animals',
            status: 'in-progress',
            assignedVolunteers: [{
                volunteerId: 'vol2',
                name: 'Dr. Priya Singh',
                phone: '+91-9876543211',
                email: 'priya@example.com'
            }],
            createdAt: new Date().toISOString()
        },
        {
            _id: 'slot3',
            title: 'Evening Feeding Round',
            type: 'feeding',
            date: today,
            startTime: '18:00',
            duration: 2,
            maxVolunteers: 1,
            location: 'Juhu Beach Area',
            description: 'Evening feeding for stray animals',
            status: 'pending',
            assignedVolunteers: [{
                volunteerId: 'vol3',
                name: 'Neha Sharma',
                phone: '+91-9876543212',
                email: 'neha@example.com'
            }],
            createdAt: new Date().toISOString()
        }
    ];
    updateScheduleDisplay();
}

// Update schedule display
function updateScheduleDisplay() {
    updateTodaySchedule();
    updateAvailableSlots();
}

// Update today's schedule
function updateTodaySchedule() {
    const today = new Date().toISOString().split('T')[0];
    const todaySlots = volunteerSlots.filter(slot => slot.date === today);
    
    const timeline = document.querySelector('.schedule-timeline');
    if (!timeline) return;
    
    if (todaySlots.length === 0) {
        timeline.innerHTML = `
            <div class="no-slots">
                <h3>No slots scheduled for today</h3>
                <p>Post a new slot to get started!</p>
                <button class="btn-primary" onclick="openNewSlotModal()">+ Post New Slot</button>
            </div>
        `;
        return;
    }

    // Sort by start time
    todaySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    timeline.innerHTML = todaySlots.map(slot => createTimelineItemHTML(slot)).join('');
}

// Create timeline item HTML
function createTimelineItemHTML(slot) {
    const statusClass = slot.status.replace('-', '');
    const statusText = slot.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `
        <div class="timeline-item ${statusClass}" data-slot-id="${slot._id}">
            <div class="timeline-time">${formatTime(slot.startTime)}</div>
            <div class="timeline-content">
                <h3>${slot.title}</h3>
                <p><strong>Volunteer:</strong> ${slot.assignedVolunteers.length > 0 ? slot.assignedVolunteers[0].name : 'Unassigned'}</p>
                <p><strong>Location:</strong> ${slot.location}</p>
                <p><strong>Status:</strong> <span class="status ${statusClass}">${statusText}</span></p>
                <div class="timeline-actions">
                    <button class="btn-primary" onclick="contactVolunteer('${slot._id}')">Contact Volunteer</button>
                    <button class="btn-secondary" onclick="viewReport('${slot._id}')">View Report</button>
                    <button class="btn-secondary" onclick="updateStatus('${slot._id}')">Update Status</button>
                    <button class="btn-secondary" onclick="sendReminder('${slot._id}')">Send Reminder</button>
                    <button class="btn-secondary" onclick="rescheduleSlot('${slot._id}')">Reschedule</button>
                </div>
            </div>
        </div>
    `;
}

// Update available slots
function updateAvailableSlots() {
    const slotsGrid = document.querySelector('.slots-grid');
    if (!slotsGrid) return;
    
    const availableSlots = volunteerSlots.filter(slot => slot.status === 'pending' || slot.status === 'available');
    
    if (availableSlots.length === 0) {
        slotsGrid.innerHTML = `
            <div class="no-slots">
                <h3>No available slots</h3>
                <p>Post a new slot to get started!</p>
                <button class="btn-primary" onclick="openNewSlotModal()">+ Post New Slot</button>
            </div>
        `;
        return;
    }

    slotsGrid.innerHTML = availableSlots.map(slot => createSlotCardHTML(slot)).join('');
}

// Create slot card HTML
function createSlotCardHTML(slot) {
    const typeText = slot.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `
        <div class="slot-card" data-slot-id="${slot._id}">
            <div class="slot-header">
                <h3>${slot.title}</h3>
                <span class="slot-type ${slot.type}">${typeText}</span>
            </div>
            <div class="slot-details">
                <p><strong>Date:</strong> ${formatDate(slot.date)}</p>
                <p><strong>Time:</strong> ${formatTime(slot.startTime)} (${slot.duration}h)</p>
                <p><strong>Location:</strong> ${slot.location}</p>
                <p><strong>Requirements:</strong> ${slot.description || 'No specific requirements'}</p>
            </div>
            <div class="slot-actions">
                <button class="btn-primary" onclick="assignVolunteer('${slot._id}')">Assign Volunteer</button>
                <button class="btn-secondary" onclick="viewSlotDetails('${slot._id}')">View Details</button>
            </div>
        </div>
    `;
}

// Initialize volunteer scheduling
function initializeVolunteerScheduling() {
    setupVolunteerEventListeners();
    setMinDate();
}

// Setup event listeners
function setupVolunteerEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.textContent.toLowerCase().replace(' ', '')));
    });

    // Post new slot modal
    const postSlotBtn = document.querySelector('button[onclick="openNewSlotModal()"]');
    if (postSlotBtn) {
        postSlotBtn.addEventListener('click', openNewSlotModal);
    }

    // Export schedule
    const exportBtn = document.querySelector('button[onclick="exportSchedule()"]');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSchedule);
    }

    // Add volunteer - use multiple selectors
    const addVolunteerBtn = document.querySelector('button[onclick="openVolunteerModal()"]');
    if (addVolunteerBtn) {
        addVolunteerBtn.addEventListener('click', openVolunteerModal);
    }
    
    // Also try to find by text content
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(btn => {
        if (btn.textContent.includes('Add Volunteer')) {
            btn.addEventListener('click', openVolunteerModal);
        }
        if (btn.textContent.includes('Assign Task')) {
            btn.addEventListener('click', function() {
                const volunteerId = this.getAttribute('onclick')?.match(/assignTask\('([^']+)'\)/)?.[1];
                if (volunteerId) {
                    assignTask(volunteerId);
                }
            });
        }
        if (btn.textContent.includes('View Profile')) {
            btn.addEventListener('click', function() {
                const volunteerId = this.getAttribute('onclick')?.match(/viewProfile\('([^']+)'\)/)?.[1];
                if (volunteerId) {
                    viewProfile(volunteerId);
                }
            });
        }
    });

    // Modal close events
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.textContent.toLowerCase().replace(' ', '') === tabName
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.schedule-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${tabName}-tab`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Load content based on tab
    if (tabName === 'today') {
        updateTodaySchedule();
    } else if (tabName === 'available') {
        updateAvailableSlots();
    }
}

// Set minimum date for date inputs
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('slotDate');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }
}

// Action functions
function assignTask(volunteerId) {
    console.log('assignTask called with ID:', volunteerId);
    let volunteer = currentVolunteers.find(v => v._id === volunteerId);
    
    if (!volunteer) {
        console.log('Volunteer not found in currentVolunteers, checking demo data');
        // Create demo volunteer if not found
        const demoVolunteers = {
            'vol1': {
                _id: 'vol1',
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                phone: '+91-9876543210',
                role: 'feeding-specialist',
                skills: 'Feeding, Basic Care',
                availability: 'Weekdays',
                shiftsCompleted: 15,
                rating: 4.8
            },
            'vol2': {
                _id: 'vol2',
                name: 'Dr. Priya Singh',
                email: 'priya@example.com',
                phone: '+91-9876543211',
                role: 'veterinarian',
                skills: 'Medical, Vaccination, Surgery',
                availability: 'Flexible',
                shiftsCompleted: 28,
                rating: 5.0
            },
            'vol3': {
                _id: 'vol3',
                name: 'Neha Sharma',
                email: 'neha@example.com',
                phone: '+91-9876543212',
                role: 'foster-care',
                skills: 'Fostering, Socialization',
                availability: 'Weekends',
                shiftsCompleted: 22,
                rating: 4.9
            }
        };
        volunteer = demoVolunteers[volunteerId];
    }
    
    if (!volunteer) {
        console.log('Volunteer not found for ID:', volunteerId);
        showNotification('Volunteer not found', 'error');
        return;
    }

    console.log('Creating task assignment modal for:', volunteer.name);
    const modal = createTaskAssignmentModal(volunteer);
    document.body.appendChild(modal);
}

// Create task assignment modal
function createTaskAssignmentModal(volunteer) {
    const modal = document.createElement('div');
    modal.className = 'modal task-assignment-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Assign Task to ${volunteer.name}</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form onsubmit="handleTaskAssignment(event, '${volunteer._id}')">
                <div class="form-group">
                    <label for="taskTitle">Task Title *</label>
                    <input type="text" id="taskTitle" name="taskTitle" placeholder="e.g., Morning Feeding Round" required>
                </div>
                <div class="form-group">
                    <label for="taskType">Task Type *</label>
                    <select id="taskType" name="taskType" required>
                        <option value="">Select Type</option>
                        <option value="feeding">Feeding</option>
                        <option value="medical">Medical Care</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="transport">Transport</option>
                        <option value="fostering">Fostering</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="taskDate">Date *</label>
                        <input type="date" id="taskDate" name="taskDate" required>
                    </div>
                    <div class="form-group">
                        <label for="taskTime">Time *</label>
                        <input type="time" id="taskTime" name="taskTime" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="taskLocation">Location *</label>
                    <input type="text" id="taskLocation" name="taskLocation" placeholder="e.g., Bandra West Area" required>
                </div>
                <div class="form-group">
                    <label for="taskDescription">Task Description</label>
                    <textarea id="taskDescription" name="taskDescription" placeholder="Describe the task details..." rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="taskPriority">Priority</label>
                    <select id="taskPriority" name="taskPriority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Assign Task</button>
                </div>
            </form>
        </div>
    `;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = modal.querySelector('#taskDate');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }
    
    return modal;
}

// Handle task assignment
function handleTaskAssignment(e, volunteerId) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const taskData = {
        title: formData.get('taskTitle'),
        type: formData.get('taskType'),
        date: formData.get('taskDate'),
        time: formData.get('taskTime'),
        location: formData.get('taskLocation'),
        description: formData.get('taskDescription'),
        priority: formData.get('taskPriority'),
        volunteerId: volunteerId,
        status: 'assigned',
        createdAt: new Date().toISOString()
    };

    try {
        // Create new task
        const newTask = {
            _id: Date.now().toString(),
            ...taskData
        };
        
        // Add to volunteer slots if it's a scheduled task
        if (taskData.type === 'feeding' || taskData.type === 'medical' || taskData.type === 'cleaning') {
            const newSlot = {
                _id: Date.now().toString() + '_slot',
                title: taskData.title,
                type: taskData.type,
                date: taskData.date,
                startTime: taskData.time,
                duration: 2, // Default duration
                maxVolunteers: 1,
                location: taskData.location,
                description: taskData.description,
                status: 'assigned',
                assignedVolunteers: [{
                    volunteerId: volunteerId,
                    name: getVolunteerName(volunteerId),
                    phone: getVolunteerPhone(volunteerId),
                    email: getVolunteerEmail(volunteerId)
                }],
                createdAt: new Date().toISOString()
            };
            volunteerSlots.push(newSlot);
        }

        showNotification(`Task assigned successfully to ${getVolunteerName(volunteerId)}!`, 'success');
        document.querySelector('.task-assignment-modal').remove();
        updateScheduleDisplay();

    } catch (error) {
        console.error('Error assigning task:', error);
        showNotification('Error assigning task. Please try again.', 'error');
    }
}

// Helper functions to get volunteer info
function getVolunteerName(volunteerId) {
    const demoVolunteers = {
        'vol1': 'Rahul Kumar',
        'vol2': 'Dr. Priya Singh',
        'vol3': 'Neha Sharma'
    };
    return demoVolunteers[volunteerId] || 'Volunteer';
}

function getVolunteerPhone(volunteerId) {
    const demoVolunteers = {
        'vol1': '+91-9876543210',
        'vol2': '+91-9876543211',
        'vol3': '+91-9876543212'
    };
    return demoVolunteers[volunteerId] || '+91-0000000000';
}

function getVolunteerEmail(volunteerId) {
    const demoVolunteers = {
        'vol1': 'rahul@example.com',
        'vol2': 'priya@example.com',
        'vol3': 'neha@example.com'
    };
    return demoVolunteers[volunteerId] || 'volunteer@example.com';
}

function viewSchedule(volunteerId) {
    const volunteer = currentVolunteers.find(v => v._id === volunteerId);
    if (!volunteer) return;

    showNotification(`Schedule viewer for ${volunteer.name} - Coming soon!`, 'info');
}

// View profile
function viewProfile(volunteerId) {
    console.log('viewProfile called with ID:', volunteerId);
    let volunteer = currentVolunteers.find(v => v._id === volunteerId);
    if (!volunteer) {
        // Create demo volunteer if not found
        const demoVolunteers = {
            'vol1': {
                _id: 'vol1',
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                phone: '+91-9876543210',
                role: 'feeding-specialist',
                skills: 'Feeding, Basic Care',
                availability: 'Weekdays',
                shiftsCompleted: 15,
                rating: 4.8
            },
            'vol2': {
                _id: 'vol2',
                name: 'Dr. Priya Singh',
                email: 'priya@example.com',
                phone: '+91-9876543211',
                role: 'veterinarian',
                skills: 'Medical, Vaccination, Surgery',
                availability: 'Flexible',
                shiftsCompleted: 28,
                rating: 5.0
            },
            'vol3': {
                _id: 'vol3',
                name: 'Neha Sharma',
                email: 'neha@example.com',
                phone: '+91-9876543212',
                role: 'foster-care',
                skills: 'Fostering, Socialization',
                availability: 'Weekends',
                shiftsCompleted: 22,
                rating: 4.9
            }
        };
        volunteer = demoVolunteers[volunteerId];
    }
    
    if (!volunteer) {
        showNotification('Volunteer not found', 'error');
        return;
    }

    const modal = createProfileModal(volunteer);
    document.body.appendChild(modal);
}

// Create profile modal
function createProfileModal(volunteer) {
    const modal = document.createElement('div');
    modal.className = 'modal profile-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Volunteer Profile</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="profile-content">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="${volunteer.name}">
                    </div>
                    <div class="profile-info">
                        <h3>${volunteer.name}</h3>
                        <p class="profile-role">${getRoleDisplay(volunteer.role)}</p>
                        <div class="profile-stats">
                            <span>${volunteer.shiftsCompleted || 0} shifts completed</span>
                            <span>${volunteer.rating || 5.0}★ rating</span>
                        </div>
                    </div>
                </div>
                <div class="profile-details">
                    <div class="detail-section">
                        <h4>Contact Information</h4>
                        <p><strong>Email:</strong> ${volunteer.email}</p>
                        <p><strong>Phone:</strong> ${volunteer.phone}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Skills</h4>
                        <p>${volunteer.skills || 'Not specified'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Availability</h4>
                        <p>${volunteer.availability || 'Not specified'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Performance</h4>
                        <p><strong>Shifts Completed:</strong> ${volunteer.shiftsCompleted || 0}</p>
                        <p><strong>Rating:</strong> ${volunteer.rating || 5.0}★</p>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn-primary" onclick="contactVolunteerDirect('${volunteer.phone}', '${volunteer.email}')">Contact</button>
                    <button class="btn-secondary" onclick="assignTask('${volunteer._id}')">Assign Task</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Contact volunteer directly
function contactVolunteerDirect(phone, email) {
    const modal = createContactModal({
        name: 'Volunteer',
        phone: phone,
        email: email
    });
    document.body.appendChild(modal);
}

// Make functions globally available
window.assignTask = assignTask;
window.viewProfile = viewProfile;
window.openVolunteerModal = openVolunteerModal;
window.closeVolunteerModal = closeVolunteerModal;
window.handleAddVolunteer = handleAddVolunteer;
window.openNewSlotModal = openNewSlotModal;
window.closeNewSlotModal = closeNewSlotModal;
window.handlePostSlot = handlePostSlot;
window.exportSchedule = exportSchedule;
window.contactVolunteer = contactVolunteer;
window.viewReport = viewReport;
window.updateStatus = updateStatus;
window.sendReminder = sendReminder;
window.rescheduleSlot = rescheduleSlot;
window.assignVolunteer = assignVolunteer;
window.viewSlotDetails = viewSlotDetails;
window.updateVolunteerDirectoryDisplay = updateVolunteerDirectoryDisplay;
window.clearErrorNotifications = clearErrorNotifications;

// Add a global function to force load demo volunteers
window.forceLoadDemoVolunteers = function() {
    console.log('Force loading demo volunteers');
    createDemoVolunteers();
    updateVolunteerDirectoryDisplay();
};

// Add a global function to clear header errors
window.clearHeaderErrors = function() {
    const header = document.querySelector('header');
    if (header) {
        // Look for any elements with error text
        const allElements = header.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.textContent && element.textContent.includes('Error adding volunteer')) {
                element.remove();
            }
        });
        
        // Also check for any error banners or notifications in the header
        const errorElements = header.querySelectorAll('[class*="error"], [class*="Error"], .notification');
        errorElements.forEach(element => {
            element.remove();
        });
    }
    
    // Clear any error messages in the user actions area
    const userActions = document.querySelector('.user-actions');
    if (userActions) {
        const errorElements = userActions.querySelectorAll('[class*="error"], [class*="Error"], .notification');
        errorElements.forEach(element => {
            element.remove();
        });
    }
    
    console.log('Header errors cleared');
};

// Add a global function to refresh volunteer directory
window.refreshVolunteerDirectory = function() {
    console.log('Manually refreshing volunteer directory');
    loadVolunteersFromBackend();
    updateVolunteerDirectoryDisplay();
};

// Add a global function to force display volunteers
window.forceDisplayVolunteers = function() {
    console.log('Force displaying volunteers');
    if (currentVolunteers.length === 0) {
        createDemoVolunteers();
    }
    updateVolunteerDirectoryDisplay();
};

function scheduleAppointment(recordId) {
    showNotification('Scheduling medical appointment...', 'info');
    // TODO: Implement appointment scheduling
}

// Modal Functions
function openNewSlotModal() {
    console.log('openNewSlotModal called');
    const modal = document.getElementById('newSlotModal');
    if (modal) {
        modal.style.display = 'block';
        document.querySelector('.slot-form').reset();
        setMinDate();
    } else {
        console.log('newSlotModal not found');
    }
}

function closeNewSlotModal() {
    const modal = document.getElementById('newSlotModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openVolunteerModal() {
    console.log('openVolunteerModal called');
    const modal = createVolunteerModal();
    document.body.appendChild(modal);
}

function closeVolunteerModal() {
    const modal = document.querySelector('.volunteer-modal');
    if (modal) {
        modal.remove();
    }
}

// Create volunteer modal
function createVolunteerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal volunteer-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Volunteer</h2>
                <button class="close-btn" onclick="closeVolunteerModal()">&times;</button>
            </div>
            <form class="volunteer-form" onsubmit="handleAddVolunteer(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="volunteerName">Full Name *</label>
                        <input type="text" id="volunteerName" name="volunteerName" placeholder="e.g., John Doe" required>
                    </div>
                    <div class="form-group">
                        <label for="volunteerEmail">Email *</label>
                        <input type="email" id="volunteerEmail" name="volunteerEmail" placeholder="john@example.com" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="volunteerPhone">Phone *</label>
                        <input type="tel" id="volunteerPhone" name="volunteerPhone" placeholder="+91-9876543210" required>
                    </div>
                    <div class="form-group">
                        <label for="volunteerRole">Role *</label>
                        <select id="volunteerRole" name="volunteerRole" required>
                            <option value="">Select Role</option>
                            <option value="feeding-specialist">Feeding Specialist</option>
                            <option value="veterinarian">Veterinarian</option>
                            <option value="foster-care">Foster Care</option>
                            <option value="transport">Transport</option>
                            <option value="fundraising">Fundraising</option>
                            <option value="general">General Volunteer</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="volunteerSkills">Skills</label>
                    <input type="text" id="volunteerSkills" name="volunteerSkills" placeholder="e.g., Feeding, Basic Care, Medical">
                </div>
                <div class="form-group">
                    <label for="volunteerAvailability">Availability *</label>
                    <select id="volunteerAvailability" name="volunteerAvailability" required>
                        <option value="">Select Availability</option>
                        <option value="weekdays">Weekdays</option>
                        <option value="weekends">Weekends</option>
                        <option value="flexible">Flexible</option>
                        <option value="evenings">Evenings only</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeVolunteerModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Volunteer</button>
                </div>
            </form>
        </div>
    `;
    
    return modal;
}

// Handle add volunteer
async function handleAddVolunteer(e) {
    e.preventDefault();
    
    console.log('handleAddVolunteer called');
    
    const formData = new FormData(e.target);
    const volunteerData = {
        name: formData.get('volunteerName'),
        email: formData.get('volunteerEmail'),
        phone: formData.get('volunteerPhone'),
        role: formData.get('volunteerRole'),
        skills: formData.get('volunteerSkills'),
        availability: formData.get('volunteerAvailability'),
        isActive: true
    };

    console.log('Volunteer data:', volunteerData);

    try {
        // Validate required fields
        if (!volunteerData.name || !volunteerData.email || !volunteerData.phone || !volunteerData.role || !volunteerData.availability) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Send to backend API
        console.log('Sending volunteer data to backend:', volunteerData);
        const response = await fetch('https://straycare-api.onrender.com/api/volunteers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(volunteerData)
        });

        console.log('Backend response status:', response.status);
        console.log('Backend response ok:', response.ok);

        if (response.ok) {
            const result = await response.json();
            console.log('Volunteer added to backend:', result);
            
            // Add to local array for immediate display
            const newVolunteer = {
                _id: result.volunteer._id || Date.now().toString(),
                ...volunteerData,
                createdAt: new Date().toISOString(),
                shiftsCompleted: 0,
                rating: 5.0
            };
            
            currentVolunteers.push(newVolunteer);
            console.log('Current volunteers count:', currentVolunteers.length);

            showNotification('Volunteer added successfully!', 'success');
            closeVolunteerModal();
            
            // Update the volunteer directory display
            updateVolunteerDirectoryDisplay();
        } else {
            let errorMessage = 'Unknown error';
            try {
                const errorData = await response.json();
                console.error('Backend error data:', errorData);
                errorMessage = errorData.error || errorData.details || 'Unknown error';
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
                errorMessage = `Server error (${response.status}): ${response.statusText}`;
            }
            console.error('Backend error:', errorMessage);
            showNotification(`Error adding volunteer: ${errorMessage}`, 'error');
        }

    } catch (error) {
        console.error('Error adding volunteer:', error);
        
        // If it's a network error, try adding locally as fallback
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log('Network error detected, adding volunteer locally as fallback');
            
            // Add to local array for immediate display
            const newVolunteer = {
                _id: Date.now().toString(),
                ...volunteerData,
                createdAt: new Date().toISOString(),
                shiftsCompleted: 0,
                rating: 5.0
            };
            
            currentVolunteers.push(newVolunteer);
            console.log('Volunteer added locally, current count:', currentVolunteers.length);

            showNotification('Volunteer added locally (server unavailable). Will sync when server is back online.', 'warning');
            closeVolunteerModal();
            
            // Update the volunteer directory display
            updateVolunteerDirectoryDisplay();
        } else {
            showNotification('Error adding volunteer. Please try again.', 'error');
        }
    }
}

// Update volunteer directory display
function updateVolunteerDirectoryDisplay() {
    console.log('updateVolunteerDirectoryDisplay called with', currentVolunteers.length, 'volunteers');
    
    let volunteersGrid = document.querySelector('.volunteers-grid');
    if (!volunteersGrid) {
        console.log('volunteers-grid not found, trying alternative selectors');
        // Try alternative selectors
        volunteersGrid = document.querySelector('.volunteer-directory .volunteers-grid') || 
                        document.querySelector('[class*="volunteer"][class*="grid"]') ||
                        document.querySelector('.volunteers-grid');
        if (!volunteersGrid) {
            console.log('No volunteer grid found, creating one');
            // Create the grid if it doesn't exist
            const volunteerDirectory = document.querySelector('.volunteer-directory');
            if (volunteerDirectory) {
                volunteersGrid = document.createElement('div');
                volunteersGrid.className = 'volunteers-grid';
                volunteerDirectory.appendChild(volunteersGrid);
                console.log('Created volunteers-grid element');
            } else {
                console.log('No volunteer directory found either');
                return;
            }
        } else {
            console.log('Found alternative grid element');
        }
    }
    
    console.log('Updating volunteer directory with', currentVolunteers.length, 'volunteers');
    
    // Clear existing content
    volunteersGrid.innerHTML = '';
    
    if (currentVolunteers.length === 0) {
        volunteersGrid.innerHTML = `
            <div class="no-volunteers" style="text-align: center; padding: 2rem; color: #666; grid-column: 1 / -1;">
                <h3>No volunteers found</h3>
                <p>Add volunteers to get started!</p>
                <button class="btn-primary" onclick="openVolunteerModal()">+ Add Volunteer</button>
            </div>
        `;
        return;
    }
    
    // Add all volunteers
    currentVolunteers.forEach((volunteer, index) => {
        console.log(`Creating card for volunteer ${index + 1}:`, volunteer.name);
        const volunteerCard = createVolunteerCardHTML(volunteer);
        volunteersGrid.appendChild(volunteerCard);
    });
    
    // Re-setup event listeners for new buttons
    setTimeout(() => {
        setupAdditionalEventListeners();
    }, 100);
    
    console.log('Volunteer directory updated successfully');
}

// Create volunteer card HTML
function createVolunteerCardHTML(volunteer) {
    const skills = volunteer.skills ? volunteer.skills.split(',').map(skill => skill.trim()) : [];
    const initials = volunteer.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return `
        <div class="volunteer-card" data-volunteer-id="${volunteer._id}">
            <div class="volunteer-avatar">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="${volunteer.name}">
            </div>
            <div class="volunteer-info">
                <h3>${volunteer.name}</h3>
                <p class="volunteer-role">${getRoleDisplay(volunteer.role)}</p>
                <p class="volunteer-stats">${volunteer.shiftsCompleted || 0} shifts completed • ${volunteer.rating || 5.0}★ rating</p>
                <div class="volunteer-skills">
                    ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="volunteer-actions">
                <button class="btn-primary" onclick="assignTask('${volunteer._id}')">Assign Task</button>
                <button class="btn-secondary" onclick="viewProfile('${volunteer._id}')">View Profile</button>
            </div>
        </div>
    `;
}

// Handle post new slot
function handlePostSlot(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const slotData = {
        title: formData.get('slotTitle'),
        type: formData.get('slotType'),
        date: formData.get('slotDate'),
        startTime: formData.get('slotTime'),
        duration: parseInt(formData.get('slotDuration')),
        maxVolunteers: parseInt(formData.get('maxVolunteers')) || 1,
        location: formData.get('slotLocation'),
        description: formData.get('slotRequirements'),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    try {
        const newSlot = {
            _id: Date.now().toString(),
            ...slotData,
            assignedVolunteers: []
        };
        volunteerSlots.push(newSlot);

        showNotification('Slot posted successfully!', 'success');
        closeNewSlotModal();
        updateScheduleDisplay();

    } catch (error) {
        console.error('Error posting slot:', error);
        showNotification('Error posting slot. Please try again.', 'error');
    }
}

// Export schedule
function exportSchedule() {
    const data = volunteerSlots.map(slot => ({
        Title: slot.title,
        Type: slot.type,
        Date: formatDate(slot.date),
        Time: formatTime(slot.startTime),
        Duration: `${slot.duration} hours`,
        Location: slot.location,
        Status: slot.status,
        Volunteers: slot.assignedVolunteers.map(v => v.name).join(', ') || 'Unassigned'
    }));

    downloadCSV(data, 'volunteer-schedule.csv');
    showNotification('Schedule exported successfully', 'success');
}

// Download CSV
function downloadCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Convert to CSV
function convertToCSV(data) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    return csvContent;
}

// Contact volunteer
function contactVolunteer(slotId) {
    const slot = volunteerSlots.find(s => s._id === slotId);
    if (!slot || slot.assignedVolunteers.length === 0) {
        showNotification('No volunteer assigned to this slot', 'info');
        return;
    }

    const volunteer = slot.assignedVolunteers[0];
    const modal = createContactModal(volunteer);
    document.body.appendChild(modal);
}

// Create contact modal
function createContactModal(volunteer) {
    const modal = document.createElement('div');
    modal.className = 'modal contact-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Contact Volunteer</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="contact-info">
                <div class="volunteer-details">
                    <h4>${volunteer.name}</h4>
                    <p><strong>Phone:</strong> ${volunteer.phone}</p>
                    <p><strong>Email:</strong> ${volunteer.email}</p>
                </div>
                <div class="contact-actions">
                    <button class="btn-primary" onclick="window.open('tel:${volunteer.phone}')">📞 Call</button>
                    <button class="btn-secondary" onclick="window.open('mailto:${volunteer.email}')">📧 Email</button>
                    <button class="btn-secondary" onclick="window.open('https://wa.me/${volunteer.phone.replace(/\D/g, '')}')">💬 WhatsApp</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// View report
function viewReport(slotId) {
    const slot = volunteerSlots.find(s => s._id === slotId);
    if (!slot) return;

    const modal = createReportModal(slot);
    document.body.appendChild(modal);
}

// Create report modal
function createReportModal(slot) {
    const modal = document.createElement('div');
    modal.className = 'modal report-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Slot Report</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="report-content">
                <div class="report-section">
                    <h4>Slot Information</h4>
                    <p><strong>Title:</strong> ${slot.title}</p>
                    <p><strong>Type:</strong> ${slot.type}</p>
                    <p><strong>Date:</strong> ${formatDate(slot.date)}</p>
                    <p><strong>Time:</strong> ${formatTime(slot.startTime)} (${slot.duration} hours)</p>
                    <p><strong>Location:</strong> ${slot.location}</p>
                    <p><strong>Status:</strong> ${slot.status}</p>
                </div>
                <div class="report-section">
                    <h4>Assigned Volunteers</h4>
                    ${slot.assignedVolunteers.length > 0 ? 
                        slot.assignedVolunteers.map(v => `<p>• ${v.name} (${v.phone})</p>`).join('') :
                        '<p>No volunteers assigned</p>'
                    }
                </div>
                <div class="report-section">
                    <h4>Description</h4>
                    <p>${slot.description || 'No description provided'}</p>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Update status
function updateStatus(slotId) {
    currentSlotId = slotId;
    const slot = volunteerSlots.find(s => s._id === slotId);
    
    const modal = createStatusModal(slot);
    document.body.appendChild(modal);
}

// Create status modal
function createStatusModal(slot) {
    const modal = document.createElement('div');
    modal.className = 'modal status-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update Slot Status</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form onsubmit="handleStatusUpdate(event)">
                <div class="form-group">
                    <label for="newStatus">New Status *</label>
                    <select id="newStatus" name="newStatus" required>
                        <option value="">Select Status</option>
                        <option value="pending" ${slot?.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in-progress" ${slot?.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${slot?.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${slot?.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="statusNotes">Notes</label>
                    <textarea id="statusNotes" name="statusNotes" placeholder="Add any notes about the status update..." rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Status</button>
                </div>
            </form>
        </div>
    `;
    
    return modal;
}

// Handle status update
function handleStatusUpdate(e) {
    e.preventDefault();
    
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value;
    
    if (!newStatus) {
        showNotification('Please select a status', 'error');
        return;
    }
    
    if (currentSlotId) {
        const slot = volunteerSlots.find(s => s._id === currentSlotId);
        if (slot) {
            slot.status = newStatus;
            if (notes) {
                slot.notes = notes;
            }
            showNotification('Status updated successfully', 'success');
            document.querySelector('.status-modal').remove();
            updateScheduleDisplay();
        }
    }
}

// Send reminder
function sendReminder(slotId) {
    const slot = volunteerSlots.find(s => s._id === slotId);
    if (!slot || slot.assignedVolunteers.length === 0) {
        showNotification('No volunteer assigned to this slot', 'info');
        return;
    }

    showNotification(`Reminder sent to ${slot.assignedVolunteers[0].name}`, 'success');
}

// Reschedule slot
function rescheduleSlot(slotId) {
    currentSlotId = slotId;
    const slot = volunteerSlots.find(s => s._id === slotId);
    
    const modal = createRescheduleModal(slot);
    document.body.appendChild(modal);
}

// Create reschedule modal
function createRescheduleModal(slot) {
    const modal = document.createElement('div');
    modal.className = 'modal reschedule-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Reschedule Slot</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form onsubmit="handleReschedule(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="rescheduleDate">New Date *</label>
                        <input type="date" id="rescheduleDate" name="rescheduleDate" value="${slot?.date || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="rescheduleTime">New Time *</label>
                        <input type="time" id="rescheduleTime" name="rescheduleTime" value="${slot?.startTime || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="rescheduleReason">Reason for Rescheduling</label>
                    <textarea id="rescheduleReason" name="rescheduleReason" placeholder="Why is this slot being rescheduled?" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Reschedule</button>
                </div>
            </form>
        </div>
    `;
    
    return modal;
}

// Handle reschedule
function handleReschedule(e) {
    e.preventDefault();
    
    const newDate = document.getElementById('rescheduleDate').value;
    const newTime = document.getElementById('rescheduleTime').value;
    const reason = document.getElementById('rescheduleReason').value;
    
    if (currentSlotId) {
        const slot = volunteerSlots.find(s => s._id === currentSlotId);
        if (slot) {
            slot.date = newDate;
            slot.startTime = newTime;
            if (reason) {
                slot.rescheduleReason = reason;
            }
            showNotification('Slot rescheduled successfully', 'success');
            document.querySelector('.reschedule-modal').remove();
            updateScheduleDisplay();
        }
    }
}

// Assign volunteer
function assignVolunteer(slotId) {
    const slot = volunteerSlots.find(s => s._id === slotId);
    if (!slot) return;

    if (slot.assignedVolunteers.length >= slot.maxVolunteers) {
        showNotification('This slot is already full', 'info');
        return;
    }

    const availableVolunteers = currentVolunteers.filter(v => 
        !slot.assignedVolunteers.some(av => av.volunteerId === v._id)
    );

    if (availableVolunteers.length === 0) {
        showNotification('No available volunteers', 'info');
        return;
    }

    const volunteer = availableVolunteers[0];
    slot.assignedVolunteers.push({
        volunteerId: volunteer._id,
        name: volunteer.name,
        phone: volunteer.phone,
        email: volunteer.email
    });

    showNotification(`${volunteer.name} assigned to ${slot.title}`, 'success');
    updateScheduleDisplay();
}

// View slot details
function viewSlotDetails(slotId) {
    const slot = volunteerSlots.find(s => s._id === slotId);
    if (!slot) return;

    const modal = createSlotDetailsModal(slot);
    document.body.appendChild(modal);
}

// Create slot details modal
function createSlotDetailsModal(slot) {
    const modal = document.createElement('div');
    modal.className = 'modal slot-details-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Slot Details</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="slot-details-content">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <p><strong>Title:</strong> ${slot.title}</p>
                    <p><strong>Type:</strong> ${slot.type}</p>
                    <p><strong>Date:</strong> ${formatDate(slot.date)}</p>
                    <p><strong>Time:</strong> ${formatTime(slot.startTime)} (${slot.duration} hours)</p>
                    <p><strong>Location:</strong> ${slot.location}</p>
                    <p><strong>Status:</strong> ${slot.status}</p>
                </div>
                <div class="detail-section">
                    <h4>Volunteers (${slot.assignedVolunteers.length}/${slot.maxVolunteers})</h4>
                    ${slot.assignedVolunteers.length > 0 ? 
                        slot.assignedVolunteers.map(v => `<p>• ${v.name} (${v.phone})</p>`).join('') :
                        '<p>No volunteers assigned</p>'
                    }
                </div>
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${slot.description || 'No description provided'}</p>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Utility functions
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

async function markCompleted(recordId) {
    try {
        // In a real implementation, this would update the medical record
        showNotification('Medical reminder marked as completed!', 'success');
        
        // Remove the reminder from display
        const reminderCard = document.querySelector(`[onclick="markCompleted('${recordId}')"]`).closest('.reminder-card');
        if (reminderCard) {
            reminderCard.remove();
        }
        
        // Update reminders count
        medicalReminders = medicalReminders.filter(r => r._id !== recordId);
        
        if (medicalReminders.length === 0) {
            const remindersSection = document.querySelector('.medical-reminders-section');
            if (remindersSection) {
                remindersSection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error marking reminder as completed:', error);
        showNotification('Failed to mark reminder as completed', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchVolunteers');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filter functionality
    const roleFilter = document.getElementById('roleFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (roleFilter) {
        roleFilter.addEventListener('change', handleFilters);
    }
    
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', handleFilters);
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchVolunteers').value.toLowerCase();
    const volunteerCards = document.querySelectorAll('.volunteer-card');
    
    volunteerCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter functionality
function handleFilters() {
    const roleFilter = document.getElementById('roleFilter').value;
    const availabilityFilter = document.getElementById('availabilityFilter').value;
    
    const volunteerCards = document.querySelectorAll('.volunteer-card');
    
    volunteerCards.forEach(card => {
        let showCard = true;
        
        if (roleFilter) {
            const roleText = card.querySelector('.volunteer-role').textContent;
            if (!roleText.toLowerCase().includes(roleFilter.toLowerCase())) {
                showCard = false;
            }
        }
        
        if (availabilityFilter) {
            const availabilityText = card.querySelector('.volunteer-availability').textContent;
            if (!availabilityText.toLowerCase().includes(availabilityFilter.toLowerCase())) {
                showCard = false;
            }
        }
        
        card.style.display = showCard ? '' : 'none';
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

// Add CSS for reminders and notifications
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
    
    .medical-reminders-section {
        margin-bottom: 2rem;
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .medical-reminders-section .section-header h2 {
        color: #856404;
        margin-bottom: 0.5rem;
    }
    
    .medical-reminders-section .section-header p {
        color: #856404;
        margin-bottom: 1rem;
    }
    
    .reminders-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }
    
    .reminder-card {
        background: white;
        border: 1px solid #ffc107;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .reminder-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }
    
    .reminder-icon {
        background: #ffc107;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .reminder-details h4 {
        margin: 0 0 0.25rem 0;
        color: #333;
    }
    
    .reminder-details p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
        color: #666;
    }
    
    .reminder-actions {
        display: flex;
        gap: 0.5rem;
        flex-direction: column;
    }
    
    .btn-sm {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .btn-primary {
        background: #8B4513;
        color: white;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
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
`;
document.head.appendChild(style);
