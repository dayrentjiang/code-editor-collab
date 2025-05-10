import { Request, Response } from "express";
import * as sessionService from "../services/session";

/**
 * Create a new tutoring session
 * @route POST /api/sessions
 */
export const createSession = async (req: Request, res: Response) => {
  try {
    const { tutorId, language, title } = req.body;

    // Validate required fields
    if (!tutorId) {
      return res.status(400).json({ message: "Tutor ID are required" });
    }

    // Create session using createSession service
    const sessionId = await sessionService.createSession(
      tutorId,
      language,
      title
    );

    // return Success Response
    return res.status(201).json({
      message: "Session created successfully",
      sessionId
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

/**
 * Get session by ID
 * @route GET /api/sessions/:sessionId
 */
export const getSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await sessionService.getSession(sessionId);
    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Return session data
    return res.status(200).json({
      message: "Session retrieved successfully",
      session
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

/**
 * Add student to session
 * @route POST /api/sessions/:sessionId/students
 */
export const addStudentToSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { studentId } = req.body;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Add student to session using addStudentToSession service
    await sessionService.addStudentToSession(sessionId, studentId);

    // Return success response
    return res.status(200).json({
      message: "Student added to session successfully"
    });
  } catch (error) {
    console.error("Error adding student to session:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

/**
 * Get all sessions of a tutor
 * @route GET /api/sessions/tutor/:tutorId
 */
export const getAllSessionsOfTutor = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;

    //validate required fields
    if (!tutorId) {
      return res.status(400).json({ message: "Tutor ID is required" });
    }

    // Get all sessions of the tutor using getAllSessionsOfTutor service
    const sessions = await sessionService.getAllSessionsByTutor(tutorId);

    // Return success response
    return res.status(200).json({
      message: "Sessions retrieved successfully",
      sessions
    });
  } catch (error) {
    console.error("Error retrieving sessions:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
