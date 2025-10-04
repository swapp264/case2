// Collaboration Page JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Add loading animation to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
    
    // Initialize button interactions
    initializeButtonInteractions();
    
    console.log('Collaboration page loaded successfully');
});

// Initialize button interactions
function initializeButtonInteractions() {
    // Case card buttons
    document.querySelectorAll('.case-card .btn-small').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.case-card');
            const title = card.querySelector('h3').textContent;
            
            if (this.textContent.includes('Offer Help')) {
                showNotification(`Offering help for ${title}`, 'info');
            } else if (this.textContent.includes('View Details')) {
                showNotification(`Viewing details for ${title}`, 'info');
            } else if (this.textContent.includes('Accept')) {
                acceptCollaborationRequest(card, title);
            }
        });
    });
    
    // Campaign card buttons
    document.querySelectorAll('.campaign-card .btn-small').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.campaign-card');
            const title = card.querySelector('h3').textContent;
            
            if (this.textContent.includes('Join Campaign')) {
                showNotification(`Joining campaign: ${title}`, 'success');
            } else if (this.textContent.includes('View Progress')) {
                showNotification(`Viewing progress for ${title}`, 'info');
            }
        });
    });
    
    // Header action buttons
    document.querySelector('.btn-secondary').addEventListener('click', function() {
        showNotification('Finding partner NGOs...', 'info');
    });
    
    // Initialize collaboration request alerts
    initializeCollaborationRequests();
}

// Accept collaboration request functionality
function acceptCollaborationRequest(card, title) {
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to accept the collaboration request for "${title}"?`);
    
    if (confirmed) {
        // Update the card to show accepted status
        const button = card.querySelector('.btn-small');
        button.textContent = 'Accepted';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        button.disabled = true;
        
        // Add accepted badge to the card
        const statusBadge = document.createElement('span');
        statusBadge.className = 'status-badge accepted';
        statusBadge.textContent = 'Accepted';
        statusBadge.style.cssText = `
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-left: 0.5rem;
        `;
        
        const cardTitle = card.querySelector('h3');
        cardTitle.appendChild(statusBadge);
        
        // Show success notification
        showNotification(`✅ Collaboration request accepted for "${title}"! The requesting NGO has been notified.`, 'success');
        
        // Simulate backend update (in real implementation, this would be an API call)
        console.log(`Collaboration accepted for: ${title}`);
    }
}

// Initialize collaboration requests with demo data
function initializeCollaborationRequests() {
    // Check if there are any pending collaboration requests
    const pendingRequests = document.querySelectorAll('.case-card .btn-small');
    let hasPendingRequests = false;
    
    pendingRequests.forEach(button => {
        if (button.textContent.includes('Accept') || button.textContent.includes('Offer Help')) {
            hasPendingRequests = true;
        }
    });
    
    // Show notification about pending requests
    if (hasPendingRequests) {
        setTimeout(() => {
            showNotification('💼 You have pending collaboration requests that need your attention!', 'warning');
        }, 2000);
    }
}

// Modal functions (placeholder)
function openNewCollaborationModal() {
    showNotification('Collaboration modal would open here', 'info');
}

function openNewCampaignModal() {
    showNotification('Campaign creation modal would open here', 'info');
}

// Filter functionality
document.getElementById('caseStatusFilter').addEventListener('change', function() {
    const filterValue = this.value;
    const caseCards = document.querySelectorAll('.case-card');
    
    caseCards.forEach(card => {
        if (!filterValue || card.classList.contains(filterValue)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    if (filterValue) {
        showNotification(`Filtered cases by status: ${filterValue}`, 'info');
    }
});

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

// Add CSS animations
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
document.head.appendChild(style);
