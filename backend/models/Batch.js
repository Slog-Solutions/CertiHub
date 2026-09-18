const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  uniqueKey: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  teachers: [{
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      default: 'Instructor',
      trim: true
    }
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  links: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  pdfs: [{
    title: {
      type: String,
      required: true
    },
    pdfUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      default: ''  // Cloudinary public_id — used for deletion
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    sentCount: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    deliveryStatus: {
      type: String,
      default: 'sent'
    }
  }],
  curriculum: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    subtopics: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      isCompleted: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date,
        default: null
      }
    }],
    order: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  feedback: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      default: '',
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublicRegistrationActive: {
    type: Boolean,
    default: false
  },
  isDefaultPublicBootcamp: {
    type: Boolean,
    default: false
  },
  // Filename of the certificate template in backend/templates used for this batch
  certificateTemplate: {
    type: String,
    default: 'default.html',
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Batch', batchSchema);
