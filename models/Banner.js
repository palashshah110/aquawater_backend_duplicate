const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [150, 'Subtitle cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Banner image is required'],
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
      maxlength: [30, 'Button text cannot exceed 30 characters'],
    },
    buttonLink: {
      type: String,
      default: '/products',
    },
    badge: {
      type: String,
      maxlength: [30, 'Badge text cannot exceed 30 characters'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching active banners in order
bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
