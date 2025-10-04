const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/straycare';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
let dbConnected = false;
mongoose.set('strictQuery', true);
// Uncomment to see queries during debugging
// mongoose.set('debug', true);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  retryWrites: true
})
.then(() => {
  dbConnected = true;
  console.log('Connected to MongoDB');
})
.catch(err => {
  dbConnected = false;
  console.error('MongoDB connection error:', err);
});

// Create volunteer application
app.post('/api/volunteer-applications', async (req, res) => {
  try {
    const required = ['name','email','phone','role','availability','motivation','terms'];
    for (const f of required) {
      if (req.body == null || req.body[f] === undefined || req.body[f] === '') {
        return res.status(400).json({ error: `Missing field: ${f}` });
      }
    }

    const application = new VolunteerApplication({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      age: req.body.age,
      role: req.body.role,
      availability: req.body.availability,
      experience: req.body.experience,
      motivation: req.body.motivation,
      terms: !!req.body.terms,
      applicationDate: req.body.applicationDate || new Date(),
      status: req.body.status || 'pending'
    });

    const saved = await application.save();
    res.status(201).json({ success: true, application: saved });
  } catch (error) {
    console.error('Create volunteer application failed:', error);
    res.status(500).json({ error: 'Failed to create application', details: error.message });
  }
});

mongoose.connection.on('connected', () => { dbConnected = true; });
mongoose.connection.on('disconnected', () => { dbConnected = false; });
mongoose.connection.on('error', () => { dbConnected = false; });

// Volunteer Application Schema
const volunteerApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    min: 16,
    max: 80
  },
  role: {
    type: String,
    required: true,
    enum: ['animal-care', 'foster-care', 'transport', 'fundraising', 'outreach']
  },
  availability: {
    type: String,
    required: true,
    enum: ['weekdays', 'weekends', 'flexible', 'evenings']
  },
  experience: {
    type: String,
    trim: true
  },
  motivation: {
    type: String,
    required: true,
    trim: true
  },
  terms: {
    type: Boolean,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contacted'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: String,
    trim: true
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const VolunteerApplication = mongoose.model('VolunteerApplication', volunteerApplicationSchema);

// Rescue Case Schema
const rescueCaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  reportedBy: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedVolunteer: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const RescueCase = mongoose.model('RescueCase', rescueCaseSchema);

// Medical Record Schema
const medicalRecordSchema = new mongoose.Schema({
  animalName: { type: String, required: true },
  animalId: { type: String, required: true, unique: true },
  breed: { type: String, required: true },
  age: { type: String, required: true },
  healthStatus: { type: String, enum: ['healthy', 'under-treatment', 'recovered', 'critical'], required: true },
  lastVaccination: { type: Date },
  vaccinationType: { type: String },
  nextVaccinationDue: { type: Date },
  sterilizationStatus: { type: String, enum: ['done', 'scheduled', 'not-done'], default: 'not-done' },
  sterilizationDate: { type: Date },
  medicalNotes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

// Volunteer Schema (approved volunteers)
const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  availability: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

// Adoption Enquiry Schema
const adoptionInquirySchema = new mongoose.Schema({
  petName: { type: String, required: true, trim: true },
  applicantName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['new', 'contacted', 'approved', 'rejected'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

const AdoptionInquiry = mongoose.model('AdoptionInquiry', adoptionInquirySchema);

// Contact Form Schema
const contactFormSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['new', 'read', 'responded'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

const ContactForm = mongoose.model('ContactForm', contactFormSchema);

// Pet Schema
const petSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  species: { type: String, required: true, enum: ['dog', 'cat', 'other'] },
  breed: { type: String, required: true, trim: true },
  age: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'unknown'] },
  size: { type: String, enum: ['small', 'medium', 'large'] },
  description: { type: String, trim: true },
  healthStatus: { type: String, default: 'healthy' },
  vaccinated: { type: Boolean, default: false },
  sterilized: { type: Boolean, default: false },
  adoptionStatus: { type: String, enum: ['available', 'pending', 'adopted'], default: 'available' },
  imageUrl: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Pet = mongoose.model('Pet', petSchema);

// API Routes

// Submit volunteer application
app.post('/api/volunteer-applications', async (req, res) => {
  try {
    const applicationData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'role', 'availability', 'motivation', 'terms'];
    const missingFields = requiredFields.filter(field => !applicationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Check if email already exists
    const existingApplication = await VolunteerApplication.findOne({ email: applicationData.email });
    if (existingApplication) {
      return res.status(409).json({
        error: 'An application with this email already exists',
        existingApplicationId: existingApplication._id
      });
    }

    // Create new application
    const newApplication = new VolunteerApplication(applicationData);
    const savedApplication = await newApplication.save();

    console.log('New volunteer application received:', {
      id: savedApplication._id,
      name: savedApplication.name,
      email: savedApplication.email,
      role: savedApplication.role
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: savedApplication._id
    });

  } catch (error) {
    console.error('Error saving volunteer application:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// Stray Report Schema
const strayReportSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  condition: { type: String, required: true, trim: true },
  locationText: { type: String, trim: true },
  lat: { type: Number },
  lng: { type: Number },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

const StrayReport = mongoose.model('StrayReport', strayReportSchema);

// API Routes

// Get all volunteer applications (for admin)
app.get('/api/volunteer-applications', async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get applications with pagination
    const applications = await VolunteerApplication
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VolunteerApplication.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: applications.length,
        totalApplications: total
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      details: error.message
    });
  }
});

// Get single volunteer application
app.get('/api/volunteer-applications/:id', async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      error: 'Failed to fetch application',
      details: error.message
    });
  }
});

// Update volunteer application status (for admin)
app.patch('/api/volunteer-applications/:id', async (req, res) => {
  try {
    const { status, adminNotes, reviewedBy } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    const updatedApplication = await VolunteerApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    console.log('Application updated:', {
      id: updatedApplication._id,
      status: updatedApplication.status,
      reviewedBy: updatedApplication.reviewedBy
    });

    res.json({
      success: true,
      message: 'Application updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      error: 'Failed to update application',
      details: error.message
    });
  }
});

// Delete volunteer application (for admin)
app.delete('/api/volunteer-applications/:id', async (req, res) => {
  try {
    const deletedApplication = await VolunteerApplication.findByIdAndDelete(req.params.id);
    
    if (!deletedApplication) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    console.log('Application deleted:', {
      id: deletedApplication._id,
      name: deletedApplication.name,
      email: deletedApplication.email
    });

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      error: 'Failed to delete application',
      details: error.message
    });
  }
});

// Rescue Cases API Routes

// Create new rescue case
app.post('/api/rescue-cases', async (req, res) => {
  try {
    const newCase = new RescueCase(req.body);
    const savedCase = await newCase.save();
    res.status(201).json({ success: true, case: savedCase });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rescue case', details: error.message });
  }
});

// Get all rescue cases
app.get('/api/rescue-cases', async (req, res) => {
  try {
    const cases = await RescueCase.find().sort({ createdAt: -1 });
    res.json({ success: true, cases });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rescue cases', details: error.message });
  }
});

// Update rescue case (assign volunteer)
app.patch('/api/rescue-cases/:id', async (req, res) => {
  try {
    const updatedCase = await RescueCase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, case: updatedCase });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rescue case', details: error.message });
  }
});

// Medical Records API Routes

// Create new medical record
app.post('/api/medical-records', async (req, res) => {
  try {
    const newRecord = new MedicalRecord(req.body);
    const savedRecord = await newRecord.save();
    res.status(201).json({ success: true, record: savedRecord });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create medical record', details: error.message });
  }
});

// Get all medical records
app.get('/api/medical-records', async (req, res) => {
  try {
    const records = await MedicalRecord.find().sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records', details: error.message });
  }
});

// Volunteers API Routes

// Get all active volunteers
app.get('/api/volunteers', async (req, res) => {
  try {
    let volunteers = await Volunteer.find({ isActive: true });
    
    // If no volunteers exist, create demo volunteers
    if (volunteers.length === 0) {
      const demoVolunteers = [
        {
          name: 'Dr. Priya Singh',
          email: 'priya@example.com',
          phone: '+91-9876543210',
          role: 'animal-care',
          availability: 'weekdays'
        },
        {
          name: 'Rahul Kumar',
          email: 'rahul@example.com',
          phone: '+91-9876543211',
          role: 'transport',
          availability: 'flexible'
        }
      ];
      
      volunteers = await Volunteer.insertMany(demoVolunteers);
    }
    
    res.json({ success: true, volunteers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteers', details: error.message });
  }
});

// Create new volunteer
app.post('/api/volunteers', async (req, res) => {
  try {
    const newVolunteer = new Volunteer(req.body);
    const savedVolunteer = await newVolunteer.save();
    res.status(201).json({ success: true, volunteer: savedVolunteer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create volunteer', details: error.message });
  }
});

// Get medical reminders due today
app.get('/api/medical-reminders/today', async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find medical records with vaccinations due today
    const reminders = await MedicalRecord.find({
      nextVaccinationDue: {
        $gte: today.setHours(0, 0, 0, 0),
        $lt: tomorrow.setHours(0, 0, 0, 0)
      }
    });
    
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical reminders', details: error.message });
  }
});

// Get application statistics (for admin dashboard)
app.get('/api/volunteer-stats', async (req, res) => {
  try {
    const stats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = await VolunteerApplication.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await VolunteerApplication.countDocuments();
    const recentApplications = await VolunteerApplication.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      stats: {
        total: totalApplications,
        recent: recentApplications,
        byStatus: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byRole: roleStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
});

// Adoption Enquiries API
app.post('/api/adoption-enquiries', async (req, res) => {
  try {
    const { petName, applicantName, email, message } = req.body;
    if (!petName || !applicantName || !email) {
      console.warn('Adoption enquiry missing fields:', { petName, applicantName, email });
      return res.status(400).json({ error: 'petName, applicantName and email are required' });
    }
    console.log('Adoption enquiry received:', { petName, applicantName, email });
    const enquiry = new AdoptionInquiry({ petName, applicantName, email, message });
    const saved = await enquiry.save();
    res.status(201).json({ success: true, id: saved._id });
  } catch (error) {
    console.error('Error saving adoption enquiry:', error);
    res.status(500).json({ error: 'Failed to submit enquiry', details: error.message });
  }
});

app.get('/api/adoption-enquiries', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      AdoptionInquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      AdoptionInquiry.countDocuments(filter)
    ]);
    res.json({ success: true, items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch adoption enquiries', details: error.message });
  }
});

// Contact Form API
app.post('/api/contact', async (req, res) => {
  try {
    console.log('Received contact form request');
    console.log('Request body:', req.body);
    
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }
    
    console.log('Creating contact form submission:', { name, email });
    const contactSubmission = new ContactForm({ name, email, message });
    const saved = await contactSubmission.save();
    
    console.log('Contact form saved successfully:', saved._id);
    return res.status(201).json({ 
      success: true, 
      message: 'Thank you for contacting us! We will get back to you soon.', 
      id: saved._id 
    });
  } catch (error) {
    console.error('Error saving contact form:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to submit contact form', 
      details: error.message 
    });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      ContactForm.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      ContactForm.countDocuments(filter)
    ]);
    res.json({ success: true, items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact submissions', details: error.message });
  }
});

// Search API - searches pets, rescue cases, and medical records
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, results: [] });
    }

    const query = q.trim();
    const searchRegex = new RegExp(query, 'i');

    // Search pets
    const pets = await Pet.find({
      $or: [
        { name: searchRegex },
        { breed: searchRegex },
        { description: searchRegex },
        { species: searchRegex }
      ],
      adoptionStatus: 'available'
    }).limit(10);

    // Search rescue cases
    const rescueCases = await RescueCase.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ]
    }).limit(10);

    // Search medical records
    const medicalRecords = await MedicalRecord.find({
      $or: [
        { animalName: searchRegex },
        { breed: searchRegex },
        { medicalNotes: searchRegex }
      ]
    }).limit(10);

    // Format results
    const results = {
      pets: pets.map(p => ({
        type: 'pet',
        id: p._id,
        title: p.name,
        subtitle: `${p.breed} • ${p.age}`,
        description: p.description,
        link: `adopt.html?pet=${p._id}`,
        image: p.imageUrl
      })),
      rescueCases: rescueCases.map(r => ({
        type: 'rescue',
        id: r._id,
        title: r.title,
        subtitle: r.location,
        description: r.description,
        link: `emergency.html?case=${r._id}`,
        status: r.status
      })),
      medicalRecords: medicalRecords.map(m => ({
        type: 'medical',
        id: m._id,
        title: m.animalName,
        subtitle: `${m.breed} • ${m.healthStatus}`,
        description: m.medicalNotes,
        link: `medical-records.html?id=${m._id}`
      }))
    };

    const totalResults = pets.length + rescueCases.length + medicalRecords.length;

    res.json({
      success: true,
      query: query,
      totalResults,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Search failed', details: error.message });
  }
});

// Pet API Routes
app.get('/api/pets', async (req, res) => {
  try {
    const { status = 'available', species, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.adoptionStatus = status;
    if (species) filter.species = species;
    
    let pets = await Pet.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
    
    // If no pets exist, create sample pets
    if (pets.length === 0) {
      const samplePets = [
        {
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: '2 years',
          gender: 'male',
          size: 'large',
          description: 'Friendly and playful golden retriever. Great with kids and other pets.',
          healthStatus: 'healthy',
          vaccinated: true,
          sterilized: true,
          adoptionStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
          location: 'Mumbai Shelter'
        },
        {
          name: 'Luna',
          species: 'cat',
          breed: 'Persian',
          age: '1 year',
          gender: 'female',
          size: 'small',
          description: 'Calm and affectionate cat. Loves quiet environments and gentle cuddles.',
          healthStatus: 'healthy',
          vaccinated: true,
          sterilized: true,
          adoptionStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2a1a220?w=400&h=300&fit=crop',
          location: 'Delhi Shelter'
        },
        {
          name: 'Max',
          species: 'dog',
          breed: 'Labrador',
          age: '3 years',
          gender: 'male',
          size: 'large',
          description: 'Energetic lab who loves to play fetch and go for long walks.',
          healthStatus: 'healthy',
          vaccinated: true,
          sterilized: false,
          adoptionStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
          location: 'Bangalore Shelter'
        }
      ];
      
      pets = await Pet.insertMany(samplePets);
      console.log('Sample pets created:', pets.length);
    }
    
    res.json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pets', details: error.message });
  }
});

app.post('/api/pets', async (req, res) => {
  try {
    const newPet = new Pet(req.body);
    const savedPet = await newPet.save();
    res.status(201).json({ success: true, pet: savedPet });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pet', details: error.message });
// Stray Reports API
app.post('/api/stray-reports', async (req, res) => {
  try {
    console.log('POST /api/stray-reports received:', req.body);
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database not connected. Please try again shortly.' });
    }
    const { type, condition, locationText = '', lat = null, lng = null, priority = 'medium' } = req.body || {};
    if (!type || !condition) {
      return res.status(400).json({ error: 'type and condition are required' });
    }

    // Save raw report
    const report = new StrayReport({ type, condition, locationText, lat, lng, priority });
    const savedReport = await report.save();

    // Mirror into RescueCase for NGO dashboard visibility
    const coords = (lat != null && lng != null) ? `(${lat}, ${lng})` : '';
    const locationCombined = [locationText, coords].filter(Boolean).join(' ');
    const newCase = new RescueCase({
      title: `${type} — ${condition}`,
      description: locationText || `${type} reported as ${condition}`,
      location: locationCombined || 'Unknown',
      reportedBy: 'anonymous',
      phone: 'N/A',
      priority: ['high', 'urgent', 'medium', 'low'].includes(priority) ? priority : 'medium'
    });
    await newCase.save();

    res.status(201).json({ success: true, id: savedReport._id });
  } catch (error) {
    console.error('Error saving stray report:', error);
    res.status(500).json({ error: 'Failed to submit stray report', details: error.message });
  }
});

// Volunteer Slots Schema
const volunteerSlotSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['feeding', 'medical', 'cleaning', 'transport', 'adoption', 'fundraising']
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  duration: { type: Number, required: true },
  maxVolunteers: { type: Number, default: 1 },
  location: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  assignedVolunteers: [{
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  }],
  notes: { type: String },
  rescheduleReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const VolunteerSlot = mongoose.model('VolunteerSlot', volunteerSlotSchema);

// Volunteer Slots API Routes

// Create new volunteer slot
app.post('/api/volunteer-slots', async (req, res) => {
  try {
    const newSlot = new VolunteerSlot(req.body);
    const savedSlot = await newSlot.save();
    res.status(201).json({ success: true, slot: savedSlot });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create volunteer slot', details: error.message });
  }
});

// Get all volunteer slots
app.get('/api/volunteer-slots', async (req, res) => {
  try {
    const { date, status, type } = req.query;
    let filter = {};
    
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const slots = await VolunteerSlot.find(filter)
      .populate('assignedVolunteers.volunteerId', 'name email phone role')
      .sort({ date: 1, startTime: 1 });
    
    res.json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteer slots', details: error.message });
  }
});

// Get today's volunteer slots
app.get('/api/volunteer-slots/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const slots = await VolunteerSlot.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('assignedVolunteers.volunteerId', 'name email phone role')
    .sort({ startTime: 1 });
    
    res.json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s slots', details: error.message });
  }
});

// Update volunteer slot
app.patch('/api/volunteer-slots/:id', async (req, res) => {
  try {
    const updatedSlot = await VolunteerSlot.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('assignedVolunteers.volunteerId', 'name email phone role');
    
    if (!updatedSlot) {
      return res.status(404).json({ error: 'Volunteer slot not found' });
    }
    
    res.json({ success: true, slot: updatedSlot });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update volunteer slot', details: error.message });
  }
});

// Assign volunteer to slot
app.post('/api/volunteer-slots/:id/assign', async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const volunteer = await Volunteer.findById(volunteerId);
    
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    const slot = await VolunteerSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ error: 'Volunteer slot not found' });
    }
    
    if (slot.assignedVolunteers.length >= slot.maxVolunteers) {
      return res.status(400).json({ error: 'Slot is already full' });
    }
    
    // Check if volunteer is already assigned
    const alreadyAssigned = slot.assignedVolunteers.some(av => av.volunteerId.toString() === volunteerId);
    if (alreadyAssigned) {
      return res.status(400).json({ error: 'Volunteer is already assigned to this slot' });
    }
    
    slot.assignedVolunteers.push({
      volunteerId: volunteer._id,
      name: volunteer.name,
      phone: volunteer.phone,
      email: volunteer.email
    });
    
    await slot.save();
    
    res.json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign volunteer', details: error.message });
  }
});

// Remove volunteer from slot
app.delete('/api/volunteer-slots/:id/volunteers/:volunteerId', async (req, res) => {
  try {
    const slot = await VolunteerSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ error: 'Volunteer slot not found' });
    }
    
    slot.assignedVolunteers = slot.assignedVolunteers.filter(
      av => av.volunteerId.toString() !== req.params.volunteerId
    );
    
    await slot.save();
    
    res.json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove volunteer', details: error.message });
  }
});

// Delete volunteer slot
app.delete('/api/volunteer-slots/:id', async (req, res) => {
  try {
    const deletedSlot = await VolunteerSlot.findByIdAndDelete(req.params.id);
    
    if (!deletedSlot) {
      return res.status(404).json({ error: 'Volunteer slot not found' });
    }
    
    res.json({ success: true, message: 'Volunteer slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete volunteer slot', details: error.message });
  }
});

// Export schedule as CSV
app.get('/api/volunteer-slots/export', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const slots = await VolunteerSlot.find(filter)
      .populate('assignedVolunteers.volunteerId', 'name email phone')
      .sort({ date: 1, startTime: 1 });
    
    // Convert to CSV format
    const csvData = slots.map(slot => ({
      Title: slot.title,
      Type: slot.type,
      Date: slot.date.toISOString().split('T')[0],
      Time: slot.startTime,
      Duration: `${slot.duration} hours`,
      Location: slot.location,
      Status: slot.status,
      Volunteers: slot.assignedVolunteers.map(v => v.name).join(', ') || 'Unassigned',
      Description: slot.description || ''
    }));
    
    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteer-schedule.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export schedule', details: error.message });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
});

module.exports = app;
