const AboutUs = require("../models/aboutUs.model");
const { cloudinary } = require("../config/config");
const errorHandler = require("../utils/errorHandler");  

const createAboutUs = async (req, res, next) => {
    try {
      // Accessing the text fields for social media icons
      const socialMediaIcons = [];
      for (let i = 0; i < 2; i++) {
        const socialIcon = {
          socialImage: req.files?.[`aboutUsSocialMediaIcons[${i}][socialImage]`]?.[0]?.path, // Cloudinary URL
          socialName: req.body?.[`aboutUsSocialMediaIcons[${i}][socialName]`],
          socialLink: req.body?.[`aboutUsSocialMediaIcons[${i}][socialLink]`],
        };
        socialMediaIcons.push(socialIcon);
      }
  
      const { aboutUsTitle, aboutUsBody } = req.body;
  
      const aboutUsData = {
        aboutUsTitle,
        aboutUsBody,
        aboutUsSocialMediaIcons: socialMediaIcons,
      };
  
      const newAboutUs = await AboutUs.create(aboutUsData);
  
      res.status(201).json({
        message: "About Us created successfully",
        data: newAboutUs,
      });
    } catch (error) {
      next(error);
    }
  
};
 
   
const viewAboutUs = async (req, res, next) => {
  try {
    const aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      return next(errorHandler(404, "About Us document not found", "NotFound"));
    }

    res.status(200).json({
      message: "About Us fetched successfully",
      data: aboutUs,
    });
  } catch (error) {
    next(error);
  }
};

const updateAboutUs = async (req, res, next) => {
  const { id } = req.params;
  const { aboutUsTitle, aboutUsBody, aboutUsSocialMediaIcons } = req.body;

  try {
    const updatedIcons = [];
    for (let icon of aboutUsSocialMediaIcons) {
      if (icon.socialImage) {
        const uploadResult = await cloudinary.uploader.upload(icon.socialImage, {
          folder: "social_media_icons",
        });

        updatedIcons.push({
          socialName: icon.socialName,
          socialImage: uploadResult.secure_url,
          socialImagePublicId: uploadResult.public_id,
          socialLink: icon.socialLink,
        });
      } else {
        // Keeps the previous image and link if no new image is provided
        updatedIcons.push({
          socialName: icon.socialName,
          socialImage: icon.socialImage,
          socialImagePublicId: icon.socialImagePublicId,
          socialLink: icon.socialLink,
        });
      }
    }

    const updatedAboutUs = await AboutUs.findByIdAndUpdate(
      id,
      { aboutUsTitle, aboutUsBody, aboutUsSocialMediaIcons: updatedIcons },
      { new: true }
    );

    if (!updatedAboutUs) {
      return next(errorHandler(404, "About Us document not found", "NotFound"));
    }

    res.status(200).json({
      message: "About Us updated successfully",
      data: updatedAboutUs,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAboutUs = async (req, res, next) => {
  const { id } = req.params;

  try {
    const aboutUs = await AboutUs.findById(id);
    if (!aboutUs) {
      return next(errorHandler(404, "About Us document not found", "NotFound"));
    }

    for (let icon of aboutUs.aboutUsSocialMediaIcons) {
      await cloudinary.uploader.destroy(icon.socialImagePublicId);
    }

    await aboutUs.remove();
    res.status(200).json({
      message: "About Us deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteSocialIconImage = async (req, res, next) => {
  const { aboutUsId, iconId } = req.params;

  try {
    const aboutUs = await AboutUs.findById(aboutUsId);
    if (!aboutUs) {
      return next(errorHandler(404, "About Us document not found", "NotFound"));
    }

    const icon = aboutUs.aboutUsSocialMediaIcons.id(iconId);
    if (!icon) {
      return next(errorHandler(404, "Social icon not found", "NotFound"));
    }

    await cloudinary.uploader.destroy(icon.socialImagePublicId);

    aboutUs.aboutUsSocialMediaIcons.pull(iconId);
    await aboutUs.save();

    res.status(200).json({
      message: "Social media icon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAboutUs,
  viewAboutUs,
  updateAboutUs,
  deleteAboutUs,
  deleteSocialIconImage,
};
