const { Readable } = require("stream");

const fs = jest.createMockFromModule("fs");

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);

function __setMockFile(newMockFiles) {
  mockFiles = { ...newMockFiles };
}

// A custom version of `readFileSync` that reads from the special mocked out
// file list set via __setMockFile
function readFileSync(path) {
  return mockFiles[path];
}

function createReadStream(path) {
  const readable = new Readable();
  const content = mockFiles[path];

  if (content) {
    content.split("\n").forEach((line) => {
      readable.push(`${line}\n`);
    });
  }

  readable.push(null);

  return readable;
}

function existsSync(path) {
  return !!mockFiles[path];
}

fs.__setMockFile = __setMockFile;
fs.readFileSync = readFileSync;
fs.existsSync = existsSync;
fs.createReadStream = createReadStream;

module.exports = fs;
