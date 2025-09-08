const { nanoid } = require('nanoid');

function attachContext(req, _res, next) {
  req.context = {
    requestId: nanoid(),
    now: new Date()
  };
  next();
}

module.exports = { attachContext };
