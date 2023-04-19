/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });

    test("It should display alert and clear file input when user try to upload a file who has invalid extension.", () => {
      // Arrange
      const instance = new NewBill({
        document: document,
        onNavigate: jest.fn(),
        store: {},
        localStorage: {},
      });

      window.alert = jest.fn();

      const fakeEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "fake/path/to/file.txt",
        },
      };

      // Act
      instance.handleChangeFile(fakeEvent);

      // Assert
      expect(window.alert).toHaveBeenCalledWith(
        "Le justificatif doit être une image au format JPG, PNG ou JPEG."
      );
      expect(fakeEvent.target.value).toBe("");
    });
  });
});
