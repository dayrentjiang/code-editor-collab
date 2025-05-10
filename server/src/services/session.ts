import { v4 as uuidv4 } from "uuid";
import * as Y from "yjs";
import Session, { ISession } from "../models/Session";

/**
 * Creates a new tutoring session.
 * @param {string} tutorId - The ID of the tutor creating the session.
 * @param {string} title - The title of the session.
 * @param {string} language - The programming language for the session.
 * @return {Promise<string>} - The created session object and then return the session ID.
 */
export const createSession = async (
  tutorId: string,
  language?: string,
  title?: string
): Promise<string> => {
  // Generate a unique session ID
  const sessionId = uuidv4();

  // Create the initial Yjs document
  const doc = new Y.Doc();
  const yText = doc.getText("editor");
  yText.insert(0, "# Welcome to your collaborative session!\n");

  // Encode the document state to a binary format
  const initialState = Y.encodeStateAsUpdate(doc);

  // create session in database
  await Session.create({
    sessionId,
    title: title ?? "Untitled Session", // default to "Untitled Session" if not provided
    tutorId,
    studentIds: [],
    documentState: Buffer.from(initialState), // Store the initial state as a Buffer
    language: language ?? "python", // default to "python" if not provided
    createdAt: new Date(),
    lastActiveAt: new Date()
  });

  return sessionId;
};

/**
 * Get the session by ID
 * @param {string} sessionId - The ID of the session to retrieve.
 * @return {Promise<ISession | null>} - The session object if found, otherwise null.
 */
export const getSession = async (
  sessionId: string
): Promise<ISession | null> => {
  return await Session.findOne({ sessionId });
};

/**
 * Add Student to the session
 * @param {string} sessionId - The ID of the session.
 * @param {string} studentId - The ID of the student to add.
 * @return null
 */
export const addStudentToSession = async (
  sessionId: string,
  studentId: string
): Promise<void> => {
  // Find session and update
  await Session.findOneAndUpdate(
    { sessionId },
    {
      $addToSet: { studentIds: studentId },
      $set: { lastActiveAt: new Date() } // Update lastActiveAt to current date
    }
  );
};

/**
 * Update the Last Active Time of the session
 * @param {string} sessionId - The ID of the session.
 * @return null
 */
export const updateLastActiveTime = async (
  sessionId: string
): Promise<void> => {
  // Find session and update
  await Session.findOneAndUpdate(
    { sessionId },
    {
      $set: { lastActiveAt: new Date() } // Update lastActiveAt to current date
    }
  );
};

/**
 * Get All sessions of a tutor
 * @param {string} tutorId - The ID of the tutor.
 * @return {Promise<ISession[]>} - An array of session objects.
 */
export const getAllSessionsByTutor = async (
  tutorId: string
): Promise<ISession[]> => {
  return await Session.find({ tutorId }).sort({ lastActive: -1 }).exec(); // Sort by lastActive in descending order
};

/**
 * Save Document State to the database
 * @param {string} sessionId - The ID of the session.
 * @param {Uint8Array} update - The Yjs document state update.
 * @return null
 */
export const saveDocumentState = async (
  sessionId: string,
  documentState: Uint8Array
): Promise<void> => {
  await Session.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        documentState: Buffer.from(documentState), // Store the updated state as a Buffer
        lastActiveAt: new Date() // Update lastActiveAt to current date
      }
    }
  );
};
