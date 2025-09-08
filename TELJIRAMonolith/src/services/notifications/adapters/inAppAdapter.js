"use strict";

const { getIo } = require("../../../socket");

/**
 * InAppAdapter emits socket events to users or project rooms.
 * This adapter focuses only on formatting and emitting, keeping transport-specific logic encapsulated.
 */
class InAppAdapter {
  /**
   * Build an event payload for in-app notifications.
   * @param {{event_type:string, recipients:any[], data:any, priority?:string, metadata?:any}} input
   * @returns {Promise<{event:string, data:any, rooms:string[]}>}
   */
  async format({ event_type, recipients, data, priority }) {
    const event = "notify";
    const payload = {
      type: event_type,
      priority: priority || "normal",
      data,
    };
    // Recipients can define explicit socket rooms (e.g., user:{id} or project:{id})
    const rooms = recipients
      .map((r) => r.user_socket_room || r.project_socket_room)
      .filter(Boolean);

    // Default to global if no rooms provided
    return { event, data: payload, rooms: rooms.length ? rooms : ["global"] };
  }

  /**
   * Emit notification to socket rooms.
   * @param {{event:string, data:any, rooms:string[]}} formatted
   * @returns {Promise<{provider:"socket-io", sentTo:string[]}>}
   */
  async send(formatted) {
    const io = getIo();
    for (const room of formatted.rooms) {
      io.to(room).emit(formatted.event, formatted.data);
    }
    return { provider: "socket-io", sentTo: formatted.rooms };
  }
}

module.exports = InAppAdapter;
