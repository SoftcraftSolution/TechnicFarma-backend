const Note = require('../model/notes.model'); // Update the path according to your file structure
const responseStructure = require('../middleware/response');
const mongoose = require('mongoose');
// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    const newNote = new Note({
      userId,
      title,
      content
    });
    const savedNote = await newNote.save();
  // Send response
  res.status(200).json(responseStructure.success(
    savedNote,
    'note created sucessfully'
  ));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate('userId');
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single note by ID
exports.getNoteById = async (req, res) => {
    try {
        const userId = req.query.userId;
    
        // Validate userId
        if (!userId) {
          return res.status(400).json(responseStructure.error('User ID is required', 400));
        }
    
        // Fetch notes associated with the userId without including user details
        const notes = await Note.find({ userId })
          .select('title content createdAt updatedAt') // Select only note fields
          .exec();
        
        if (notes.length === 0) {
          return res.status(404).json(responseStructure.error('No notes found for the specified user', 404));
        }
    
        // Construct the response object
        res.status(200).json(responseStructure.success(
          notes,
          'Notes fetched successfully'
        ));
      } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json(responseStructure.error('Server error', 500));
      }
    };
// Update a note by ID
exports.updateNote = async (req, res) => {
  try {
      const noteId = req.query.id; // Get the noteId from the query parameter
      console.log('Received noteId:', noteId); // Log the noteId to the console

      const { title, content } = req.body; // Extract title and content from the request body

      // Validate input
      if (!mongoose.Types.ObjectId.isValid(noteId)) {
          return res.status(400).json(responseStructure.error('Invalid note ID format', 400));
      }
      if (!title && !content) {
          return res.status(400).json(responseStructure.error('At least one field (title or content) is required', 400));
      }

      // Find the note by ID
      const note = await Note.findById(noteId);
      if (!note) {
          return res.status(404).json(responseStructure.error('Note not found', 404));
      }

      // Update the note's fields
      if (title) note.title = title;
      if (content) note.content = content;
      note.updatedAt = Date.now(); // Update the timestamp

      // Save the updated note
      const updatedNote = await note.save();

      // Send success response
      res.status(200).json(responseStructure.success(
          updatedNote,
          'Note updated successfully'
      ));
  } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json(responseStructure.error('Server error', 500));
  }
};


// Delete a note by ID
exports.deleteNote = async (req, res) => {
    try {
      const noteId = req.query.id; // Get the noteId from the query parameter
  
      // Validate noteId
      if (!noteId) {
        return res.status(400).json(responseStructure.error('Note ID is required', 400));
      }
  
      // Find and delete the note
      const deletedNote = await Note.findByIdAndDelete(noteId);
      if (!deletedNote) {
        return res.status(404).json(responseStructure.error('Note not found', 404));
      }
  
      // Send success response
      res.status(200).json(responseStructure.success(
        { deletedNote },
        'Note deleted successfully'
      ));
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };