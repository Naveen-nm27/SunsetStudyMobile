import { runDatabaseOperation } from './database';
import {
  calculateReviewSchedule,
  toStudyDay,
} from './reviewSchedule';

function normalizeName(name) {
  const normalized = name.trim();
  if (!normalized) throw new Error('A name is required.');
  return normalized;
}

async function refreshSchedule(db, topicId) {
  const sessions = await db.getAllAsync(
    'SELECT completedAt, studyDay FROM sessions WHERE topicId = ?',
    topicId,
  );
  const schedule = calculateReviewSchedule(sessions);
  await db.runAsync(
    'UPDATE topics SET nextReviewDay = ?, completedAt = ?, reviewsCompleted = ? WHERE id = ?',
    schedule.nextReviewDay,
    schedule.completedAt,
    schedule.reviewsCompleted,
    topicId,
  );
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

  async recordSession(topicId, completion = new Date()) {
    const studyDay = toStudyDay(completion);
    const completedAt = completion.getTime();

    await runDatabaseOperation((db) =>
      db.withTransactionAsync(async () => {
        const topic = await db.getFirstAsync(
          `SELECT subjects.archivedAt FROM topics
           JOIN subjects ON subjects.id = topics.subjectId WHERE topics.id = ?`,
          topicId,
        );
        if (!topic) throw new Error('Topic not found.');
        if (topic.archivedAt !== null) throw new Error('Restore the subject before logging a session.');

        const inserted = await db.runAsync(
          `INSERT INTO sessions (topicId, completedAt, studyDay) VALUES (?, ?, ?)
           ON CONFLICT (topicId, completedAt) DO NOTHING`,
          topicId,
          completedAt,
          studyDay,
        );
        if (inserted.changes) await refreshSchedule(db, topicId);
      }),
    );
  },
};
