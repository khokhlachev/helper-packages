jest.mock("fs");
jest.mock("child_process");
jest.createMockFromModule("@khokhlachev/utils");

const { parseLine, parseFile } = require("../src/push-env");

describe("push-env", () => {
  const FILE = `VAR_1=xxx
    `;

  beforeEach(() => {
    // Set up some mocked out file info before each test
    require("fs").__setMockFile({
      ".env": FILE,
    });
  });

  it("parses line without new line", () => {
    expect(parseLine("A=B\n")).toEqual(["A", "B"]);
  });

  it("parses file", (done) => {
    function callback(key, value) {
      try {
        expect(key).toBe("VAR_1");
        expect(value).toBe("xxx");
        done();
      } catch (error) {
        done(error);
      }
    }

    parseFile(".env", callback);
  });
});
