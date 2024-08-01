const Note = require('../model/notes.model'); // Update the path according to your file structure
const responseStructure = require('../middleware/response');
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
    'Location data for users with their salesmen fetched successfully'
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
    const noteId = req.params.id;
    const note = await Note.findById(noteId).populate('userId');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a note by ID
exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a note by ID
exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const deletedNote = await Note.findByIdAndDelete(noteId);
    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
