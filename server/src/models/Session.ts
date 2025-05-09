import mongoose, { Schema, Document } from "mongoose";

// Interface defining the session document structure
export interface ISession extends Document {
  sessionId: string; // Unique identifier for the session
  title: string; // Name of the session, e.g., "Python Basics"
  tutorId: string; // ID of the tutor conducting the session
  studentIds: string[]; // Array of student IDs participating in the session
  documentState: Buffer; // Y.js document state, The documentState Buffer is the "memory" of our collaborative editor.
  language: string; // Programming language used in the session
  createdAt: Date; // Timestamp of when the session was created
  lastActiveAt: Date; // Timestamp of the last activity in the session
}

// the actual schema definition
const sessionSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true // Create an index on sessionId for faster lookups
  },
  title: {
    type: String,
    default: "Untitled Session"
  },
  tutorId: {
    type: String,
    required: true,
    index: true // Create an index on tutorId for faster lookups
  },
  studentIds: {
    type: [String]
  },

  documentState: Buffer,

  //programming language used in the session
  language: {
    type: String,
    default: "python"
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActive: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model<ISession>("Session", sessionSchema);
