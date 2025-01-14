const classModel = require('../models/classmodel');

const classController = {
    
    // Create a new class
    async createClass(req, res) {
      try {
        const { className, numberOfRows, price, availability } = req.body;
        const classes = new classModel({
          className,
          numberOfRows,
          price,
          availability,
        });
        await classes.save();
        res.status(201).json({ message: 'Seat class created successfully!', classes });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },
    

    // Get all classes
  async getAllClasses(req, res) {
    try {
      const allClasses = await classModel.find();
      res.status(200).json(allClasses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  
//    Get a single class by ID

async getClassById (req, res) {
    try {
      const { id } = req.params;
      const seatClass = await classModel.findById(id);
      if (!seatClass) {
        return res.status(404).json({ message: 'Seat class not found' });
      }
      res.status(200).json(seatClass);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  //    Update a class by ID
   
  async updateClass (req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedClass = await classModel.findByIdAndUpdate(id, updates, {
        new: true, // Return the updated document
        runValidators: true, // Enforce schema validations
      });

      if (!updatedClass) {
        return res.status(404).json({ message: 'Seat class not found' });
      }

      res.status(200).json({
        message: 'Seat class updated successfully!',
        data: updatedClass,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


//    Delete a seat class by ID

async deleteClass (req, res){
    try {
      const { id } = req.params;

      const deletedClass = await classModel.findByIdAndDelete(id);

      if (!deletedClass) {
        return res.status(404).json({ message: 'Seat class not found' });
      }

      res.status(200).json({
        message: 'Seat class deleted successfully!',
        data: deletedClass,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

}  

module.exports = classController;