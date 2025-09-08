const registry = [];

// PUBLIC_INTERFACE
function registerPlugin(plugin) {
  /** Registers a plugin with optional hooks: { onIssueCreated(issue), onSprintStarted(sprint) } */
  registry.push(plugin);
}

// PUBLIC_INTERFACE
function emit(event, payload) {
  /** Emits events to registered plugins */
  for (const p of registry) {
    const fn = p[event];
    if (typeof fn === 'function') {
      Promise.resolve().then(() => fn(payload)).catch(() => {});
    }
  }
}

module.exports = { registerPlugin, emit };
