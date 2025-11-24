// Rescue Cases Management JavaScript

// Global variables
let currentCases = [];
let filteredCases = [];
let currentPage = 1;
const casesPerPage = 4;

// DOM Elements
const searchInput = document.getElementById('searchCases');
const statusFilter = document.getElementById('statusFilter');
const locationFilter = document.getElementById('locationFilter');
const priorityFilter = document.getElementById('priorityFilter');
const casesGrid = document.getElementById('casesGrid');
const newCaseModal = document.getElementById('newCaseModal');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadCasesFromBackend();
    setupEventListeners();
    restoreFiltersFromStorage();
    // Set footer year dynamically
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});

// Load cases from backend
async function loadCasesFromBackend() {
    try {
        const response = await fetch('https://straycare-api.onrender.com/api/rescue-cases');
        const data = await response.json();
        
        if (data.success) {
            currentCases = data.cases.map(case_ => ({
                id: case_._id,
                title: case_.title,
                status: case_.status,
                priority: case_.priority,
                location: case_.location.toLowerCase().split(' ')[0],
                reportedBy: case_.reportedBy,
                locationFull: case_.location,
                reportedTime: formatTimeAgo(case_.createdAt),
                animalType: case_.description.split(',')[0] || 'Animal',
                condition: case_.description,
                assignedVolunteer: case_.assignedVolunteer,
                phone: case_.phone,
                image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
            }));
        } else {
            currentCases = [];
        }
        
        // Apply localStorage updates from dashboard assignments
        applyCaseUpdatesFromLocalStorage();
        
        // Restore locally added cases
        restoreLocalCasesFromStorage();
        
        filteredCases = [...currentCases];
        updateCasesDisplay();
        updateStats();
    } catch (error) {
        console.error('Error loading cases:', error);
        showNotification('Failed to load cases from server', 'error');
        
        // Load fallback demo data
        loadFallbackCases();
        
        // Apply localStorage updates
        applyCaseUpdatesFromLocalStorage();
        
        // Restore locally added cases
        restoreLocalCasesFromStorage();
        
        filteredCases = [...currentCases];
        updateCasesDisplay();
        updateStats();
    }
}

// Load fallback cases for demo
function loadFallbackCases() {
    currentCases = [
        {
            id: 'test1',
            title: 'Injured Dog - Bandra West',
            status: 'pending',
            priority: 'high',
            location: 'bandra',
            reportedBy: 'Priya Sharma',
            locationFull: 'Bandra West, Mumbai',
            reportedTime: '2 hours ago',
            animalType: 'Dog (Mixed Breed)',
            condition: 'Injured leg, limping',
            phone: '+91-9876543210',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'test2',
            title: 'Sick Cat - Andheri East',
            status: 'in-progress',
            priority: 'medium',
            location: 'andheri',
            reportedBy: 'Amit Patel',
            locationFull: 'Andheri East, Mumbai',
            reportedTime: '4 hours ago',
            animalType: 'Cat (Domestic)',
            condition: 'Respiratory infection',
            assignedVolunteer: 'Dr. Meera',
            phone: '+91-9876543211',
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2a1a220?w=300&h=200&fit=crop'
        },
        {
            id: 'test3',
            title: 'Abandoned Puppies - Juhu Beach',
            status: 'rescued',
            priority: 'low',
            location: 'juhu',
            reportedBy: 'Neha Sharma',
            locationFull: 'Juhu Beach, Mumbai',
            reportedTime: '1 day ago',
            animalType: 'Puppies (3)',
            condition: 'Healthy, need vaccination',
            phone: '+91-9876543212',
            image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=300&h=200&fit=crop'
        },
        {
            id: 'test4',
            title: 'Recovering Dog - Dadar',
            status: 'treated',
            priority: 'medium',
            location: 'dadar',
            reportedBy: 'Rajesh Kumar',
            locationFull: 'Dadar, Mumbai',
            reportedTime: '3 days ago',
            animalType: 'Dog (Labrador Mix)',
            condition: 'Post-surgery recovery',
            phone: '+91-9876543213',
            image: 'https://images.unsplash.com/photo-1543852786-1cf6624b998d?w=300&h=200&fit=crop'
        },
        {
            id: 'test5',
            title: 'Stray Kitten - Bandra East',
            status: 'pending',
            priority: 'high',
            location: 'bandra',
            reportedBy: 'Simran Kaur',
            locationFull: 'Bandra East, Mumbai',
            reportedTime: '30 minutes ago',
            animalType: 'Kitten',
            condition: 'Dehydrated, crying',
            phone: '+91-9876543214',
            image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&h=200&fit=crop'
        },
        {
            id: 'test6',
            title: 'Hit-and-run Dog - Andheri West',
            status: 'in-progress',
            priority: 'high',
            location: 'andheri',
            reportedBy: 'Vikas Yadav',
            locationFull: 'Andheri West, Mumbai',
            reportedTime: '1 hour ago',
            animalType: 'Dog',
            condition: 'Possible fracture',
            assignedVolunteer: 'Amit Sharma',
            phone: '+91-9876543215',
            image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=200&fit=crop'
        },
        {
            id: 'test7',
            title: 'Parvo Suspected - Juhu',
            status: 'treated',
            priority: 'medium',
            location: 'juhu',
            reportedBy: 'Pooja Nair',
            locationFull: 'Juhu, Mumbai',
            reportedTime: '5 hours ago',
            animalType: 'Puppy',
            condition: 'Under observation',
            phone: '+91-9876543216',
            image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=300&h=200&fit=crop'
        },
        {
            id: 'test8',
            title: 'Rescued Cat - Dadar Market',
            status: 'rescued',
            priority: 'low',
            location: 'dadar',
            reportedBy: 'Arjun Verma',
            locationFull: 'Dadar Market, Mumbai',
            reportedTime: 'Yesterday',
            animalType: 'Cat',
            condition: 'Safe, minor wounds',
            phone: '+91-9876543217',
            image: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=300&h=200&fit=crop'
        },
        {
            id: 'test9',
            title: 'Puppy Stuck - Bandra Link',
            status: 'pending',
            priority: 'medium',
            location: 'bandra',
            reportedBy: 'Krishna Rao',
            locationFull: 'Bandra Linking Road, Mumbai',
            reportedTime: '3 hours ago',
            animalType: 'Puppy',
            condition: 'Stuck under car',
            phone: '+91-9876543218',
            image: 'https://images.unsplash.com/photo-1537151672237-64b210bf3037?w=300&h=200&fit=crop'
        },
        {
            id: 'test10',
            title: 'Dog with Mange - Andheri',
            status: 'in-progress',
            priority: 'medium',
            location: 'andheri',
            reportedBy: 'Anita Das',
            locationFull: 'Andheri East, Mumbai',
            reportedTime: 'Today',
            animalType: 'Dog',
            condition: 'Skin infection, mange',
            phone: '+91-9876543219',
            image: 'https://images.unsplash.com/photo-1558944351-c6ae3783a5b5?w=300&h=200&fit=crop'
        },
        {
            id: 'test11',
            title: 'Injured Crow - Juhu',
            status: 'pending',
            priority: 'low',
            location: 'juhu',
            reportedBy: 'Ridhi Mehta',
            locationFull: 'Juhu Tara Road, Mumbai',
            reportedTime: '2 hours ago',
            animalType: 'Bird',
            condition: 'Wing injury',
            phone: '+91-9876543220',
            image: 'https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=300&h=200&fit=crop'
        },
        {
            id: 'test12',
            title: 'Cat for Adoption - Dadar',
            status: 'rescued',
            priority: 'low',
            location: 'dadar',
            reportedBy: 'Shelter',
            locationFull: 'Dadar, Mumbai',
            reportedTime: 'Last week',
            animalType: 'Cat',
            condition: 'Ready for adoption',
            phone: '+91-9876543221',
            image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=300&h=200&fit=crop'
        }
    ];
}

// Apply case updates from localStorage (from dashboard assignments)
function applyCaseUpdatesFromLocalStorage() {
    try {
        const caseUpdates = JSON.parse(localStorage.getItem('caseUpdates')) || {};
        
        Object.keys(caseUpdates).forEach(caseId => {
            const caseIndex = currentCases.findIndex(c => c.id === caseId);
            if (caseIndex !== -1) {
                const updates = caseUpdates[caseId];
                currentCases[caseIndex] = {
                    ...currentCases[caseIndex],
                    ...updates
                };
                console.log(`Applied updates to case ${caseId}:`, updates);
            }
        });
    } catch (error) {
        console.error('Error applying case updates from localStorage:', error);
    }
}

// Format time ago helper
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
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSearch();
        });
    }
    
    // Filter functionality
    statusFilter.addEventListener('change', handleFilters);
    locationFilter.addEventListener('change', handleFilters);
    priorityFilter.addEventListener('change', handleFilters);
    
    // Modal close on outside click
    window.addEventListener('click', function(event) {
        if (event.target === newCaseModal) {
            closeNewCaseModal();
        }
    });
    
    // Form submission
    const caseForm = document.querySelector('.case-form');
    if (caseForm) {
        caseForm.addEventListener('submit', handleNewCaseSubmit);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredCases = [...currentCases];
    } else {
        filteredCases = currentCases.filter(case_ => 
            case_.title.toLowerCase().includes(searchTerm) ||
            case_.reportedBy.toLowerCase().includes(searchTerm) ||
            case_.locationFull.toLowerCase().includes(searchTerm) ||
            case_.animalType.toLowerCase().includes(searchTerm) ||
            case_.condition.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateCasesDisplay();
    updateStats();
    saveFiltersToStorage();
}

// Handle filter changes
function handleFilters() {
    const statusValue = statusFilter.value;
    const locationValue = locationFilter.value;
    const priorityValue = priorityFilter.value;
    
    filteredCases = currentCases.filter(case_ => {
        const statusMatch = !statusValue || case_.status === statusValue;
        const locationMatch = !locationValue || case_.location === locationValue;
        const priorityMatch = !priorityValue || case_.priority === priorityValue;
        
        return statusMatch && locationMatch && priorityMatch;
    });
    
    currentPage = 1;
    updateCasesDisplay();
    updateStats();
    saveFiltersToStorage();
}

// Update cases display
function updateCasesDisplay() {
    const startIndex = (currentPage - 1) * casesPerPage;
    const endIndex = startIndex + casesPerPage;
    const casesToShow = filteredCases.slice(startIndex, endIndex);
    
    casesGrid.innerHTML = '';
    
    if (casesToShow.length === 0) {
        casesGrid.innerHTML = `
            <div class="no-cases">
                <h3>No cases found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    casesToShow.forEach(case_ => {
        const caseCard = createCaseCard(case_);
        casesGrid.appendChild(caseCard);
    });
    
    updatePagination();
}

// Create case card element
function createCaseCard(case_) {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.setAttribute('data-status', case_.status);
    card.setAttribute('data-location', case_.location);
    card.setAttribute('data-priority', case_.priority);
    
    const statusClass = case_.status.replace('-', '');
    const priorityClass = case_.priority;
    
    card.innerHTML = `
        <div class="case-image">
            <img src="${case_.image}" alt="${case_.title}">
            <span class="status-badge ${statusClass}">${getStatusDisplay(case_.status)}</span>
            <span class="priority-badge ${priorityClass}">${getPriorityDisplay(case_.priority)}</span>
        </div>
        <div class="case-info">
            <h3>${case_.title}</h3>
            <div class="case-details">
                <p><strong>Reported by:</strong> ${case_.reportedBy}</p>
                <p><strong>Location:</strong> ${case_.locationFull}</p>
                <p><strong>Reported:</strong> ${case_.reportedTime || 'Recently'}</p>
                ${case_.assignedVolunteer ? `<p><strong>Assigned to:</strong> ${case_.assignedVolunteer}</p>` : ''}
                ${case_.assignedTo ? `<p><strong>Assigned to:</strong> ${case_.assignedTo}</p>` : ''}
                ${case_.rescuedBy ? `<p><strong>Rescued by:</strong> ${case_.rescuedBy}</p>` : ''}
                ${case_.treatedBy ? `<p><strong>Treated by:</strong> ${case_.treatedBy}</p>` : ''}
                <p><strong>Animal Type:</strong> ${case_.animalType}</p>
                <p><strong>Condition:</strong> ${case_.condition}</p>
            </div>
            <div class="case-actions">
                ${getActionButtons(case_)}
            </div>
        </div>
    `;
    
    return card;
}

// Get status display text
function getStatusDisplay(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'rescued': 'Rescued',
        'treated': 'Treated',
        'adopted': 'Adopted'
    };
    return statusMap[status] || status;
}

// Get priority display text
function getPriorityDisplay(priority) {
    const priorityMap = {
        'high': 'High Priority',
        'medium': 'Medium Priority',
        'low': 'Low Priority'
    };
    return priorityMap[priority] || priority;
}

// Get action buttons based on case status
function getActionButtons(case_) {
    switch (case_.status) {
        case 'pending':
            return `
                <button class="btn-primary" onclick="assignVolunteer('${case_.id}')">Assign Volunteer</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="updateStatus('${case_.id}')">Update Status</button>
            `;
        case 'in-progress':
            return `
                <button class="btn-primary" onclick="updateStatus('${case_.id}')">Update Status</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="addMedicalRecord('${case_.id}')">Medical Record</button>
            `;
        case 'rescued':
            return `
                <button class="btn-primary" onclick="scheduleVaccination('${case_.id}')">Schedule Vaccination</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="prepareAdoption('${case_.id}')">Prepare for Adoption</button>
            `;
        case 'treated':
            return `
                <button class="btn-primary" onclick="scheduleFollowUp('${case_.id}')">Schedule Follow-up</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="prepareAdoption('${case_.id}')">Prepare for Adoption</button>
            `;
        default:
            return `
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
            `;
    }
}

// Update statistics
function updateStats() {
    const total = filteredCases.length;
    const pending = filteredCases.filter(c => c.status === 'pending').length;
    const inProgress = filteredCases.filter(c => c.status === 'in-progress').length;
    const rescued = filteredCases.filter(c => c.status === 'rescued').length;
    
    const statsContainer = document.querySelector('.cases-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <span class="stat">Total: ${total}</span>
            <span class="stat pending">Pending: ${pending}</span>
            <span class="stat in-progress">In Progress: ${inProgress}</span>
            <span class="stat rescued">Rescued: ${rescued}</span>
        `;
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredCases.length / casesPerPage);
    const pagination = document.querySelector('.pagination');
    
    if (!pagination) return;
    
    let paginationHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
        `;
    }
    
    paginationHTML += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredCases.length / casesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateCasesDisplay();
    }
}

// Modal functions
function openNewCaseModal() {
    newCaseModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeNewCaseModal() {
    newCaseModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Reset form
    const form = document.querySelector('.case-form');
    if (form) form.reset();
}

// Handle new case form submission
async function handleNewCaseSubmit(event) {
    event.preventDefault();
    
    const newCaseData = {
        title: document.getElementById('caseTitle').value,
        description: document.getElementById('condition').value,
        location: document.getElementById('location').value,
        reportedBy: document.getElementById('reporterName').value,
        phone: document.getElementById('reporterPhone').value,
        priority: document.getElementById('priority').value
    };
    
    try {
        const response = await fetch('https://straycare-api.onrender.com/api/rescue-cases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCaseData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload cases from backend to get updated list
            await loadCasesFromBackend();
            
            // Close modal
            closeNewCaseModal();
            
            // Show success message
            showNotification('New case created successfully!', 'success');
        } else {
            // Fallback: add case locally so UI still updates
            addCaseLocally(newCaseData);
            closeNewCaseModal();
            showNotification('Saved locally (server unavailable).', 'info');
        }
    } catch (error) {
        console.error('Error creating case:', error);
        // Fallback: add case locally so UI still updates
        addCaseLocally(newCaseData);
        closeNewCaseModal();
        showNotification('Offline: case added locally.', 'info');
    }
}

// Add case locally when server is not reachable
function addCaseLocally(newCaseData) {
    const localCase = {
        id: `local-${Date.now()}`,
        title: newCaseData.title,
        status: 'pending',
        priority: newCaseData.priority || 'medium',
        location: (newCaseData.location || '').toLowerCase().split(' ')[0],
        reportedBy: newCaseData.reportedBy,
        locationFull: newCaseData.location,
        reportedTime: 'Just now',
        animalType: 'Animal',
        condition: newCaseData.description,
        phone: newCaseData.phone,
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
    };
    currentCases = [localCase, ...currentCases];
    filteredCases = [...currentCases];
    
    // Save locally added cases to localStorage
    saveLocalCasesToStorage();
    
    updateCasesDisplay();
    updateStats();
}

// Save locally added cases to localStorage
function saveLocalCasesToStorage() {
    try {
        const localCases = currentCases.filter(c => c.id && c.id.startsWith('local-'));
        localStorage.setItem('rescueCasesLocal', JSON.stringify(localCases));
    } catch (error) {
        console.error('Failed to save local cases:', error);
    }
}

// Restore locally added cases from localStorage
function restoreLocalCasesFromStorage() {
    try {
        const savedLocalCases = localStorage.getItem('rescueCasesLocal');
        if (savedLocalCases) {
            const localCases = JSON.parse(savedLocalCases);
            
            // Add local cases that don't already exist
            localCases.forEach(localCase => {
                const exists = currentCases.some(c => c.id === localCase.id);
                if (!exists) {
                    currentCases.unshift(localCase);
                }
            });
        }
    } catch (error) {
        console.error('Failed to restore local cases:', error);
    }
}

// Save current filters to localStorage
function saveFiltersToStorage() {
    try {
        const filters = {
            search: searchInput ? searchInput.value : '',
            status: statusFilter ? statusFilter.value : '',
            location: locationFilter ? locationFilter.value : '',
            priority: priorityFilter ? priorityFilter.value : ''
        };
        localStorage.setItem('rescueCasesFilters', JSON.stringify(filters));
    } catch (error) {
        console.error('Failed to save filters:', error);
    }
}

// Restore filters from localStorage
function restoreFiltersFromStorage() {
    try {
        const savedFilters = localStorage.getItem('rescueCasesFilters');
        if (savedFilters) {
            const filters = JSON.parse(savedFilters);
            
            // Restore search input
            if (searchInput && filters.search) {
                searchInput.value = filters.search;
            }
            
            // Restore filter dropdowns
            if (statusFilter && filters.status) {
                statusFilter.value = filters.status;
            }
            
            if (locationFilter && filters.location) {
                locationFilter.value = filters.location;
            }
            
            if (priorityFilter && filters.priority) {
                priorityFilter.value = filters.priority;
            }
            
            // Apply the restored filters after cases are loaded
            setTimeout(() => {
                if (filters.search || filters.status || filters.location || filters.priority) {
                    applyAllFilters();
                }
            }, 100);
        }
    } catch (error) {
        console.error('Failed to restore filters:', error);
    }
}

// Apply all filters (search + dropdowns)
function applyAllFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const locationValue = locationFilter ? locationFilter.value : '';
    const priorityValue = priorityFilter ? priorityFilter.value : '';
    
    filteredCases = currentCases.filter(case_ => {
        // Search filter
        const searchMatch = !searchTerm || (
            case_.title.toLowerCase().includes(searchTerm) ||
            case_.reportedBy.toLowerCase().includes(searchTerm) ||
            case_.locationFull.toLowerCase().includes(searchTerm) ||
            case_.animalType.toLowerCase().includes(searchTerm) ||
            case_.condition.toLowerCase().includes(searchTerm)
        );
        
        // Dropdown filters
        const statusMatch = !statusValue || case_.status === statusValue;
        const locationMatch = !locationValue || case_.location === locationValue;
        const priorityMatch = !priorityValue || case_.priority === priorityValue;
        
        return searchMatch && statusMatch && locationMatch && priorityMatch;
    });
    
    currentPage = 1;
    updateCasesDisplay();
    updateStats();
}

// Action functions
async function assignVolunteer(caseId) {
    try {
        // Fetch available volunteers
        const response = await fetch('https://straycare-api.onrender.com/api/volunteers');
        const data = await response.json();
        
        if (data.success && data.volunteers.length > 0) {
            // Create volunteer selection modal
            const modal = createVolunteerAssignmentModal(caseId, data.volunteers);
            document.body.appendChild(modal);
        } else {
            // Use fallback volunteers
            const fallbackVolunteers = createFallbackVolunteers();
            const modal = createVolunteerAssignmentModal(caseId, fallbackVolunteers);
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        // Use fallback volunteers
        const fallbackVolunteers = createFallbackVolunteers();
        const modal = createVolunteerAssignmentModal(caseId, fallbackVolunteers);
        document.body.appendChild(modal);
    }
}

// Create fallback volunteers for rescue-cases page
function createFallbackVolunteers() {
    return [
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
}

// Create volunteer assignment modal
function createVolunteerAssignmentModal(caseId, volunteers) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Assign Volunteer</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="assignVolunteerForm">
                    <div class="form-group">
                        <label for="volunteerSelect">Select Volunteer:</label>
                        <select id="volunteerSelect" required>
                            <option value="">Choose a volunteer...</option>
                            ${volunteers.map(v => `<option value="${v.name}">${v.name} - ${v.role} (${v.availability})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Assign Volunteer</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Handle form submission
    modal.querySelector('#assignVolunteerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const volunteerName = document.getElementById('volunteerSelect').value;
        
        if (!volunteerName) {
            showNotification('Please select a volunteer', 'error');
            return;
        }
        
        try {
            // Update case locally (fallback approach)
            const caseIndex = currentCases.findIndex(c => c.id === caseId);
            if (caseIndex !== -1) {
                currentCases[caseIndex].assignedVolunteer = volunteerName;
                currentCases[caseIndex].status = 'in-progress';
                
                // Update localStorage for cross-page sync
                let caseUpdates = JSON.parse(localStorage.getItem('caseUpdates')) || {};
                caseUpdates[caseId] = {
                    assignedVolunteer: volunteerName,
                    status: 'in-progress',
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem('caseUpdates', JSON.stringify(caseUpdates));
                
                // Close modal
                modal.remove();
                
                // Save updated cases to localStorage
                saveLocalCasesToStorage();
                
                // Refresh display
                filteredCases = [...currentCases];
                updateCasesDisplay();
                updateStats();
                
                showNotification(`✅ Volunteer ${volunteerName} assigned successfully!`, 'success');
            } else {
                showNotification('Case not found', 'error');
            }
        } catch (error) {
            console.error('Error assigning volunteer:', error);
            showNotification('Failed to assign volunteer', 'error');
        }
    });
    
    return modal;
}

function viewCaseDetails(caseId) {
    const caseData = currentCases.find(c => c.id === caseId);
    if (!caseData) {
        showNotification('Case not found', 'error');
        return;
    }
    
    const modal = createCaseDetailsModal(caseData);
    document.body.appendChild(modal);
}

function updateStatus(caseId) {
    const caseData = currentCases.find(c => c.id === caseId);
    if (!caseData) {
        showNotification('Case not found', 'error');
        return;
    }
    
    const modal = createStatusUpdateModal(caseData);
    document.body.appendChild(modal);
}

function addMedicalRecord(caseId) {
    showNotification('Opening medical record form...', 'info');
    // TODO: Implement medical record modal
}

function scheduleVaccination(caseId) {
    showNotification('Opening vaccination scheduler...', 'info');
    // TODO: Implement vaccination scheduling
}

function prepareAdoption(caseId) {
    showNotification('Preparing for adoption...', 'info');
    // TODO: Implement adoption preparation
}

function scheduleFollowUp(caseId) {
    showNotification('Opening follow-up scheduler...', 'info');
    // TODO: Implement follow-up scheduling
}

function exportCases() {
    try {
        const rows = [
            [
                'ID',
                'Title',
                'Status',
                'Priority',
                'Location (Area)',
                'Location (Full)',
                'Reported By',
                'Reported Time',
                'Animal Type',
                'Condition',
                'Assigned Volunteer',
                'Phone'
            ],
            ...filteredCases.map(c => [
                c.id || '',
                c.title || '',
                getStatusDisplay(c.status || ''),
                getPriorityDisplay(c.priority || ''),
                c.location || '',
                c.locationFull || '',
                c.reportedBy || '',
                c.reportedTime || '',
                c.animalType || '',
                (c.condition || '').replace(/\n/g, ' '),
                c.assignedVolunteer || c.assignedTo || '',
                c.phone || ''
            ])
        ];

        const csv = rows
            .map(row => row
                .map(field => {
                    const value = String(field ?? '');
                    const needsQuotes = /[",\n]/.test(value);
                    const escaped = value.replace(/"/g, '""');
                    return needsQuotes ? `"${escaped}"` : escaped;
                })
                .join(','))
            .join('\n');

        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.href = url;
        link.download = `straycare-rescue-cases-${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification('✅ Cases exported as CSV', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Failed to export cases', 'error');
    }
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
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
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
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin: 0;
    }
    
    .no-cases {
        text-align: center;
        padding: 3rem;
        color: #666;
    }
    
    .no-cases h3 {
        margin-bottom: 1rem;
        color: #8B4513;
    }
    
    .case-details-content {
        padding: 1rem 0;
    }
    
    .case-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .case-header h3 {
        margin: 0;
        color: #8B4513;
    }
    
    .case-badges {
        display: flex;
        gap: 0.5rem;
    }
    
    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .detail-section {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #8B4513;
    }
    
    .detail-section h4 {
        margin: 0 0 0.75rem 0;
        color: #8B4513;
        font-size: 1rem;
    }
    
    .detail-section p {
        margin: 0.5rem 0;
        font-size: 0.9rem;
    }
    
    .status-badge, .priority-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status-badge.pending {
        background: #ffc107;
        color: #000;
    }
    
    .status-badge.in-progress, .status-badge.inprogress {
        background: #17a2b8;
        color: white;
    }
    
    .status-badge.rescued {
        background: #28a745;
        color: white;
    }
    
    .status-badge.treated {
        background: #6f42c1;
        color: white;
    }
    
    .status-badge.adopted {
        background: #20c997;
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
    
    .priority-badge.low {
        background: #6c757d;
        color: white;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
    
    .current-case-info {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }
    
    .current-case-info h3 {
        margin: 0 0 0.5rem 0;
        color: #8B4513;
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
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #8B4513;
        box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.1);
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

// Create case details modal
function createCaseDetailsModal(caseData) {
    const modal = document.createElement('div');
    modal.className = 'modal case-details-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-info-circle"></i> Case Details</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="case-details-content">
                    <div class="case-header">
                        <h3>${caseData.title}</h3>
                        <div class="case-badges">
                            <span class="status-badge ${caseData.status}">${getStatusDisplay(caseData.status)}</span>
                            <span class="priority-badge ${caseData.priority}">${getPriorityDisplay(caseData.priority)}</span>
                        </div>
                    </div>
                    
                    <div class="details-grid">
                        <div class="detail-section">
                            <h4>Reporter Information</h4>
                            <p><strong>Name:</strong> ${caseData.reportedBy}</p>
                            <p><strong>Phone:</strong> ${caseData.phone || 'Not provided'}</p>
                            <p><strong>Reported:</strong> ${caseData.reportedTime}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Location Details</h4>
                            <p><strong>Address:</strong> ${caseData.locationFull}</p>
                            <p><strong>Area:</strong> ${caseData.location}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Animal Information</h4>
                            <p><strong>Type:</strong> ${caseData.animalType}</p>
                            <p><strong>Condition:</strong> ${caseData.condition}</p>
                        </div>
                        
                        ${caseData.assignedVolunteer ? `
                        <div class="detail-section">
                            <h4>Assignment Details</h4>
                            <p><strong>Assigned to:</strong> ${caseData.assignedVolunteer}</p>
                            <p><strong>Status:</strong> ${getStatusDisplay(caseData.status)}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button type="button" class="btn-primary" onclick="editCase('${caseData.id}')">Edit Case</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Create status update modal
function createStatusUpdateModal(caseData) {
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
                <div class="current-case-info">
                    <h3>${caseData.title}</h3>
                    <p><strong>Current Status:</strong> <span class="status-badge ${caseData.status}">${getStatusDisplay(caseData.status)}</span></p>
                </div>
                
                <form id="statusUpdateForm">
                    <div class="form-group">
                        <label for="newStatus">New Status:</label>
                        <select id="newStatus" required>
                            <option value="">Select new status...</option>
                            <option value="pending" ${caseData.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="in-progress" ${caseData.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="rescued" ${caseData.status === 'rescued' ? 'selected' : ''}>Rescued</option>
                            <option value="treated" ${caseData.status === 'treated' ? 'selected' : ''}>Treated</option>
                            <option value="adopted" ${caseData.status === 'adopted' ? 'selected' : ''}>Adopted</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="statusNotes">Update Notes:</label>
                        <textarea id="statusNotes" rows="3" placeholder="Add notes about this status update..."></textarea>
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
        await handleStatusUpdate(caseData.id);
    });
    
    return modal;
}

// Handle status update
async function handleStatusUpdate(caseId) {
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value;
    
    if (!newStatus) {
        showNotification('Please select a status', 'error');
        return;
    }
    
    try {
        // Update case status
        const caseIndex = currentCases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
            currentCases[caseIndex].status = newStatus;
            
            // Close modal
            document.querySelector('.status-update-modal').remove();
            
            // Save updated cases to localStorage
            saveLocalCasesToStorage();
            
            // Refresh display
            filteredCases = [...currentCases];
            updateCasesDisplay();
            updateStats();
            
            showNotification(`✅ Case status updated to ${getStatusDisplay(newStatus)}!`, 'success');
        } else {
            showNotification('Case not found', 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Failed to update status', 'error');
    }
}

// Edit case function
function editCase(caseId) {
    const caseData = currentCases.find(c => c.id === caseId);
    if (!caseData) {
        showNotification('Case not found', 'error');
        return;
    }
    
    // Close current modal first
    document.querySelector('.case-details-modal').remove();
    
    const modal = createEditCaseModal(caseData);
    document.body.appendChild(modal);
}

// Create edit case modal
function createEditCaseModal(caseData) {
    const modal = document.createElement('div');
    modal.className = 'modal edit-case-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-edit"></i> Edit Case</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editCaseForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editTitle">Case Title:</label>
                            <input type="text" id="editTitle" value="${caseData.title}" required>
                        </div>
                        <div class="form-group">
                            <label for="editPriority">Priority:</label>
                            <select id="editPriority" required>
                                <option value="high" ${caseData.priority === 'high' ? 'selected' : ''}>High Priority</option>
                                <option value="medium" ${caseData.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                                <option value="low" ${caseData.priority === 'low' ? 'selected' : ''}>Low Priority</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editReporter">Reporter Name:</label>
                            <input type="text" id="editReporter" value="${caseData.reportedBy}" required>
                        </div>
                        <div class="form-group">
                            <label for="editPhone">Reporter Phone:</label>
                            <input type="tel" id="editPhone" value="${caseData.phone || ''}" placeholder="+91-XXXXXXXXXX">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="editLocation">Location:</label>
                        <input type="text" id="editLocation" value="${caseData.locationFull}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editAnimalType">Animal Type:</label>
                        <input type="text" id="editAnimalType" value="${caseData.animalType}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editCondition">Condition Description:</label>
                        <textarea id="editCondition" rows="3" required>${caseData.condition}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Handle form submission
    modal.querySelector('#editCaseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleEditCase(caseData.id);
    });
    
    return modal;
}

// Handle edit case
async function handleEditCase(caseId) {
    const updatedData = {
        title: document.getElementById('editTitle').value,
        priority: document.getElementById('editPriority').value,
        reportedBy: document.getElementById('editReporter').value,
        phone: document.getElementById('editPhone').value,
        locationFull: document.getElementById('editLocation').value,
        animalType: document.getElementById('editAnimalType').value,
        condition: document.getElementById('editCondition').value
    };
    
    try {
        // Update case locally
        const caseIndex = currentCases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
            currentCases[caseIndex] = {
                ...currentCases[caseIndex],
                ...updatedData,
                location: updatedData.locationFull.toLowerCase().split(' ')[0] // Update location key
            };
            
            // Close modal
            document.querySelector('.edit-case-modal').remove();
            
            // Save updated cases to localStorage
            saveLocalCasesToStorage();
            
            // Refresh display
            filteredCases = [...currentCases];
            updateCasesDisplay();
            
            showNotification('✅ Case updated successfully!', 'success');
        } else {
            showNotification('Case not found', 'error');
        }
    } catch (error) {
        console.error('Error updating case:', error);
        showNotification('Failed to update case', 'error');
    }
}
