# StrayCare - Comprehensive Animal Welfare Platform

A modern, feature-rich web platform designed to connect NGOs, volunteers, and communities for better animal welfare management and rescue operations.

## Backend Setup for Volunteer Management

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env` file and update MongoDB URI if needed
   - Default: `mongodb://localhost:27017/straycare`

3. Start MongoDB (if using local installation):
```bash
mongod
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### API Endpoints

#### Volunteer Applications
- `POST /api/volunteer-applications` - Submit new application
- `GET /api/volunteer-applications` - Get all applications (admin)
- `GET /api/volunteer-applications/:id` - Get specific application
- `PATCH /api/volunteer-applications/:id` - Update application status
- `DELETE /api/volunteer-applications/:id` - Delete application
- `GET /api/volunteer-stats` - Get application statistics

### Database Schema

#### VolunteerApplication
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  age: Number,
  role: String (required) - ['animal-care', 'foster-care', 'transport', 'fundraising', 'outreach'],
  availability: String (required) - ['weekdays', 'weekends', 'flexible', 'evenings'],
  experience: String,
  motivation: String (required),
  terms: Boolean (required),
  applicationDate: Date,
  status: String - ['pending', 'approved', 'rejected', 'contacted'],
  adminNotes: String,
  reviewedBy: String,
  reviewedAt: Date
}
```

### Features

#### Frontend (volunteer.html)
- Interactive role cards with detailed popups
- Comprehensive volunteer application form
- Real-time form validation
- Responsive design

#### Backend (server.js)
- RESTful API for volunteer management
- MongoDB integration with Mongoose
- Input validation and error handling
- Admin dashboard support
- Application status tracking

### 🔹 For NGOs & Organizations

#### 1. **Rescue Case Management Dashboard**
- **Real-time Case Tracking**: Monitor rescue cases with status updates (Pending, In Progress, Rescued, Treated, Adopted)
- **Location-based Reporting**: View cases with geolocation data and photos
- **Volunteer Assignment**: Assign volunteers to specific rescue cases
- **Case Analytics**: Track performance metrics and success rates
- **Export Functionality**: Generate reports and export case data

#### 2. **Medical Records & Vaccination Tracking**
- **Comprehensive Health Records**: Store vaccination, deworming, and sterilization details
- **Automated Reminders**: Get notifications for follow-up vaccinations and treatments
- **Treatment History**: Maintain complete medical history for each animal
- **Veterinary Integration**: Connect with veterinary professionals

#### 3. **Volunteer Scheduling System**
- **Slot Management**: NGOs can post available volunteer slots (feeding, fostering, vet visits)
- **Booking System**: Volunteers can book slots like a scheduling system
- **Real-time Updates**: Track volunteer availability and assignments
- **Performance Tracking**: Monitor volunteer contributions and ratings

#### 4. **NGO Collaboration Hub**
- **Resource Sharing**: Share rescue cases with other NGOs when lacking space/resources
- **Joint Campaigns**: Coordinate adoption drives and donation campaigns
- **Network Building**: Connect with other animal welfare organizations
- **Collaborative Projects**: Work together on large-scale rescue operations

### 🔹 For Users & Community

#### 5. **Pet Lost & Found Section**
- **Photo + Geolocation Reports**: Report lost pets or found animals with precise location
- **Map-based Search**: Interactive map showing nearby lost/found reports
- **Real-time Updates**: Get notifications when matches are found
- **Community Alerts**: Share reports on social media platforms

#### 6. **Adoption Matchmaking System**
- **Lifestyle-based Recommendations**: Match pets based on user lifestyle (home type, activity level, pet size)
- **Pre-adoption Questionnaire**: Comprehensive suitability assessment
- **Pet Profiles**: Detailed information about each adoptable animal
- **Adoption Process Tracking**: Monitor application status and requirements

#### 7. **Pet Care Helpline (AI Chatbot + FAQ)**
- **24/7 AI Assistant**: Get immediate guidance for pet emergencies
- **First-aid Instructions**: Step-by-step emergency care guidance
- **Expert Consultation**: Connect with veterinary professionals
- **Educational Content**: Tips on feeding, sterilization, and fostering

#### 8. **Reward Points System**
- **Earn Points**: Users earn points for reporting, donating, or volunteering
- **Redeemable Rewards**: Exchange points for certificates, NGO merchandise, or pet shop discounts
- **Achievement System**: Unlock badges and recognition for contributions
- **Community Leaderboards**: Friendly competition to encourage participation

### 🔹 Community & Awareness

#### 9. **Crowdfunding for Individual Cases**
- **Individual Campaign Pages**: Each rescue case gets its own donation page
- **Transparency Tracking**: Show how funds are used with detailed breakdowns
- **Progress Updates**: Regular updates on rescued animals' recovery
- **Donor Recognition**: Acknowledge contributors and their impact

#### 10. **Awareness Campaigns & Events**
- **Event Management**: NGOs can post events (vaccination drives, adoption fairs, workshops)
- **RSVP System**: Users can register for events and share on social media
- **Educational Content**: Blogs and videos on animal welfare topics
- **Community Engagement**: Interactive campaigns and challenges

#### 11. **Legal Help Section**
- **Animal Rights Information**: Guidance on animal welfare laws in India
- **Legal Resources**: Connect with animal lawyers and activists
- **Complaint Filing**: Report cruelty cases with proper documentation
- **Legal Support Network**: Access to legal professionals and resources

#### 12. **Educational Content Hub**
- **Comprehensive Blog**: Articles on stray care, sterilization importance, adoption awareness
- **Video Library**: Educational videos and tutorials
- **Expert Interviews**: Insights from veterinarians and animal behaviorists
- **Resource Downloads**: Printable guides and educational materials

## 🛠 Technical Features

### **Modern Web Technologies**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Progressive Web App**: Fast loading and offline capabilities
- **Real-time Updates**: Live notifications and status changes
- **Interactive Maps**: Location-based services and navigation

### **User Experience**
- **Intuitive Interface**: Clean, modern design with easy navigation
- **Accessibility**: WCAG compliant for users with disabilities
- **Multi-language Support**: Available in multiple languages
- **Dark/Light Mode**: Customizable theme preferences

### **Security & Privacy**
- **Data Protection**: Secure handling of user and animal data
- **Privacy Controls**: User-controlled data sharing settings
- **Encrypted Communications**: Secure messaging and file sharing
- **Regular Backups**: Automated data backup and recovery

## 📱 Platform Structure

### **Core Pages**
1. **Dashboard** (`dashboard.html`) - NGO management interface
2. **Rescue Cases** (`rescue-cases.html`) - Case management system
3. **Volunteers** (`volunteers.html`) - Scheduling and volunteer management
4. **Lost & Found** (`lost-found.html`) - Pet reporting and search
5. **Helpline** (`helpline.html`) - AI chatbot and emergency support
6. **Adoption** (`adopt.html`) - Pet adoption platform
7. **Rewards** (`rewards.html`) - Points and rewards system

### **Supporting Features**
- **User Authentication**: Login/registration system
- **Profile Management**: User and NGO profile customization
- **Notification System**: Real-time alerts and updates
- **Search & Filter**: Advanced search capabilities across all content
- **Social Integration**: Share content on social media platforms

## 🎯 Impact & Benefits

### **For Animals**
- **Faster Rescue Response**: Quicker identification and response to animal emergencies
- **Better Medical Care**: Comprehensive health tracking and treatment
- **Higher Adoption Rates**: Improved matching and adoption processes
- **Reduced Suffering**: Immediate access to care and support

### **For NGOs**
- **Efficient Operations**: Streamlined case management and volunteer coordination
- **Better Resource Allocation**: Data-driven decision making
- **Increased Reach**: Broader community engagement and support
- **Collaborative Networks**: Stronger partnerships and resource sharing

### **For Communities**
- **Increased Awareness**: Educational content and awareness campaigns
- **Active Participation**: Easy ways to contribute and help animals
- **Better Pet Care**: Access to expert advice and resources
- **Stronger Bonds**: Community building through shared animal welfare goals

## 🚀 Getting Started

### **For NGOs**
1. Register your organization
2. Set up your profile and capabilities
3. Start posting rescue cases and volunteer opportunities
4. Connect with other NGOs and volunteers

### **For Volunteers**
1. Create your profile with skills and availability
2. Browse available volunteer opportunities
3. Book slots and track your contributions
4. Earn points and recognition for your work

### **For Users**
1. Register to access all features
2. Report lost/found animals or browse adoptable pets
3. Use the helpline for pet care advice
4. Participate in community events and campaigns

## 📞 Support & Contact

- **24/7 Helpline**: 1800-STRAYCARE
- **Email**: support@straycare.com
- **Emergency**: For urgent animal welfare issues
- **Technical Support**: For platform-related questions

## 🤝 Contributing

We welcome contributions from developers, designers, and animal welfare advocates. Please see our contribution guidelines for more information.

---

**StrayCare** - Making the world better for animals, one rescue at a time. 🐾
