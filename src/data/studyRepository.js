import { runDatabaseOperation } from './database';
import { toStudyDay } from './reviewSchedule';

function normalizeName(name) {
  const normalized = name.trim();
  if (!normalized) throw new Error('A name is required.');
  return normalized;
}

export const studyRepository = {
  listSubjects() {
    return runDatabaseOperation((db) =>
      db.getAllAsync('SELECT * FROM subjects ORDER BY archivedAt IS NOT NULL, name COLLATE NOCASE, id'),
    );
  },

  async createSubject(name) {
    const normalized = normalizeName(name);
    return runDatabaseOperation(async (db) => {
      const result = await db.runAsync('INSERT INTO subjects (name) VALUES (?)', normalized);
      return result.lastInsertRowId;
    });
  },

  async renameSubject(subjectId, name) {
    const normalized = normalizeName(name);
    await runDatabaseOperation(async (db) => {
      const result = await db.runAsync('UPDATE subjects SET name = ? WHERE id = ?', normalized, subjectId);
      if (!result.changes) throw new Error('Subject not found.');
    });
  },

  async setSubjectArchived(subjectId, archived) {
    await runDatabaseOperation(async (db) => {
      const result = await db.runAsync(
        'UPDATE subjects SET archivedAt = CASE WHEN ? THEN COALESCE(archivedAt, ?) END WHERE id = ?',
        archived ? 1 : 0,
        Date.now(),
        subjectId,
      );
      if (!result.changes) throw new Error('Subject not found.');
    });
  },

  listTopics(subjectId) {
    return runDatabaseOperation((db) =>
      db.getAllAsync('SELECT * FROM topics WHERE subjectId = ? ORDER BY name COLLATE NOCASE, id', subjectId),
    );
  },

  async createTopic(subjectId, name) {
    const normalized = normalizeName(name);
    return runDatabaseOperation(async (db) => {
      const result = await db.runAsync('INSERT INTO topics (subjectId, name) VALUES (?, ?)', subjectId, normalized);
      return result.lastInsertRowId;
    });
  },

  async renameTopic(topicId, name) {
    const normalized = normalizeName(name);
    await runDatabaseOperation(async (db) => {
      const result = await db.runAsync('UPDATE topics SET name = ? WHERE id = ?', normalized, topicId);
      if (!result.changes) throw new Error('Topic not found.');
    });
  },

  listDueTopics(today = toStudyDay(new Date())) {
    return runDatabaseOperation((db) =>
      db.getAllAsync(
        `SELECT topics.* FROM topics
         JOIN subjects ON subjects.id = topics.subjectId
         WHERE subjects.archivedAt IS NULL AND topics.nextReviewDay <= ?
         ORDER BY topics.nextReviewDay, topics.id`,
        today,
      ),
    );
  },

  listSessions(topicId) {
    return runDatabaseOperation((db) =>
      db.getAllAsync(
        'SELECT * FROM sessions WHERE topicId = ? ORDER BY studyDay DESC, completedAt DESC, id DESC',
        topicId,
      ),
    );
  },
};
