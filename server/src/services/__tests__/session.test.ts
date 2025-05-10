import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi
} from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as sessionService from "../session";
import Session, { ISession } from "../../models/Session";
import * as Y from "yjs";

// Mock UUID for consisten test results
vi.mock("uuid", () => ({
  v4: () => "test-session-id"
}));

/**
 * Test suite for the Session Service
 * This suite tests the functionality of the session service, including creating sessions,
 * adding students, and retrieving sessions.
 */
describe("Session Service", () => {
  let mongoServer: MongoMemoryServer;

  //setup a new in-memory MongoDB server before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear the database after each test
  afterEach(async () => {
    await Session.deleteMany({});
  });

  // Test the createSession function
  describe("createSession", () => {
    it("should create a new session and return the session ID", async () => {
      // Arrange
      const title = "Test Session";
      const tutorId = "test-tutor-id";
      const language = "python";

      // Act
      const sessionId = await sessionService.createSession(
        tutorId,
        language,
        title
      );

      // Assert
      expect(sessionId).toBe("test-session-id");
      const session = await Session.findOne({ sessionId });
      expect(session).toBeTruthy();
      expect(session?.title).toBe(title);
      expect(session?.tutorId).toBe(tutorId);
      expect(session?.studentIds).toEqual([]);
      expect(session?.language).toBe("python");
      expect(session?.documentState).toBeTruthy();
    });

    it("should use a default title if not provided", async () => {
      // Arrange
      const tutorId = "test-tutor-id";
      const language = "python";

      // Act
      await sessionService.createSession(tutorId, language);

      // Assert
      const session = await Session.findOne({ sessionId: "test-session-id" });
      expect(session?.title).toBe("Untitled Session");
    });
  });

  /**
   * Test the getSession by ID function
   * This test checks if the function correctly retrieves a session by its ID.
   */
  describe("getSession", () => {
    it("should return session by ID", async () => {
      // Arrange
      const doc = new Y.Doc();
      const state = Y.encodeStateAsUpdate(doc);

      await Session.create({
        sessionId: "test-session-id",
        title: "Test Session",
        tutorId: "test-tutor-id",
        documentState: Buffer.from(state)
      });

      // Act
      const session = await sessionService.getSession("test-session-id");

      // Assert
      expect(session).toBeTruthy();
      expect(session?.sessionId).toBe("test-session-id");
    });

    it("should return null for non-existent session", async () => {
      // Act
      const session = await sessionService.getSession("non-existent-id");

      // Assert
      expect(session).toBeNull();
    });
  });

  /**
   * Test the addStudentToSession function
   * This test checks if the function correctly adds a student to a session.
   */
  describe("addStudentToSession", () => {
    it("should add a student to the session", async () => {
      // Arrange
      const sessionId = "test-session-id";
      const studentId = "test-student-id";
      const doc = new Y.Doc();
      const state = Y.encodeStateAsUpdate(doc);

      // we dont use the createSession function here to makesure we are testing the addStudentToSession function
      await Session.create({
        sessionId,
        title: "Test Session",
        tutorId: "test-tutor-id",
        studentIds: [],
        documentState: Buffer.from(state)
      });

      // Act
      await sessionService.addStudentToSession(sessionId, studentId);

      // Assert
      let session = await Session.findOne({ sessionId: sessionId });
      expect(session?.studentIds).toEqual([studentId]);

      // Act again to add another student
      const anotherStudentId = "another-student-id";
      await sessionService.addStudentToSession(sessionId, anotherStudentId);
      session = await Session.findOne({ sessionId: sessionId });

      // Assert - make sure both students are added
      expect(session?.studentIds).toEqual([studentId, anotherStudentId]);

      // Act to add the same student again
      await sessionService.addStudentToSession(sessionId, studentId);
      session = await Session.findOne({ sessionId: sessionId });

      // Assert - make sure not duplicated
      expect(session?.studentIds).toEqual([studentId, anotherStudentId]);
    });
  });

  /**
   * Test the saveDocumentState function
   * This test checks if the function correctly saves the document state to the session.
   */
  describe("saveDocumentState", () => {
    it("should save the document state to the session", async () => {
      // Arrange
      const sessionId = "test-session-id";
      const doc = new Y.Doc();
      const initialState = Y.encodeStateAsUpdate(doc);
      const session = await Session.create({
        sessionId,
        title: "Test Session",
        tutorId: "test-tutor-id",
        studentIds: [],
        documentState: Buffer.from(initialState)
      });

      // Act
      // Simulate some changes to the document
      const newDoc = new Y.Doc();
      const newState = Y.encodeStateAsUpdate(newDoc);
      const updatedState = Buffer.from(newState);
      await sessionService.saveDocumentState(sessionId, updatedState);
      const updatedSession = await Session.findOne({ sessionId });

      // Assert
      expect(updatedSession).toBeTruthy();
    });
  });
});
