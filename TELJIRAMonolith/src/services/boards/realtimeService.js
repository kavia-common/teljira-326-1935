"use strict";

const { getIo } = require("../../socket");

/**
 * realtimeService: helpers for emitting board-related events.
 */

// PUBLIC_INTERFACE
/**
 * Compute the room name for a board.
 * @param {string} board_id
 * @param {string} [project_id]
 * @returns {string} room key
 */
function getBoardRoom(board_id, project_id) {
  // For future: we may also join users to board rooms; project_id is optional if we want to include project-based broadcasts.
  return `board:${board_id}`;
}

// PUBLIC_INTERFACE
/**
 * Emit a board-scoped event safely.
 * @param {string} roomKey
 * @param {string} eventName
 * @param {any} payload
 */
function emitBoardEvent(roomKey, eventName, payload) {
  try {
    const io = getIo();
    io.to(roomKey).emit(eventName, payload);
  } catch (_) {
    // ignore if socket not initialized
  }
}

module.exports = { getBoardRoom, emitBoardEvent };
