/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let instance;
    let html;

    beforeAll(() => {
      html = NewBillUI();
      document.body.innerHTML = html;

      instance = new NewBill({
        document: document,
        onNavigate: jest.fn(),
        store: {},
        localStorage: {},
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
    });

    // describe("When I click on the submit button", () => {
    //   test("Then it should call handleSubmit method", () => {
    //     // Arrange
    //     const fakeEvent = {
    //       preventDefault: jest.fn(),

    //       target: {
    //         value: "fake/path/to/file.txt",
    //       },
    //     };

    //     const result = instance.handleSubmit(fakeEvent);

    //     const submitButton = document.querySelector(`button[type="submit"]`);

    //     // Act
    //     submitButton.click();

    //     // Assert
    //     expect(result).toHaveBeenCalled();
    //   });
    // });

    describe("When I upload a file", () => {
      test("Then it should display alert and clear file input when I try to upload a file who has invalid extension.", () => {
        // Arrange

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
});

describe("NewBill", () => {
  describe("handleSubmit", () => {
    test("should call onNavigate with bills route and update the bill when form is submitted", async () => {
      const mockStore = {
        bills: jest.fn(() => ({
          create: jest.fn(() => Promise.resolve({ fileUrl: "url", key: 1 })),
          update: jest.fn(() => Promise.resolve()),
        })),
      };

      const mockDocument = {
        querySelector: jest.fn(),
      };

      const mockOnNavigate = jest.fn();
      const mockLocalStorage = {
        getItem: jest.fn(() =>
          JSON.stringify({ email: "user@test.com", password: "password" })
        ),
      };

      // mock form and input elements
      const mockExpenseTypeInput = {
        value: "Hôtel",
      };

      const mockExpenseNameInput = {
        value: "Hotel du Louvre",
      };

      const mockAmountInput = {
        value: "100",
      };

      const mockDateInput = {
        value: "2022-01-01",
      };

      const mockVatInput = {
        value: "20",
      };

      const mockCommentaryInput = {
        value: "Some commentary",
      };

      const mockFileInput = {
        files: [
          {
            name: "test.jpg",
          },
        ],
      };

      const mockForm = {
        addEventListener: jest.fn(),
        querySelector: jest.fn((selector) => {
          switch (selector) {
            case 'select[data-testid="expense-type"]':
              return mockExpenseTypeInput;
            case 'input[data-testid="expense-name"]':
              return mockExpenseNameInput;
            case 'input[data-testid="amount"]':
              return mockAmountInput;
            case 'input[data-testid="datepicker"]':
              return mockDateInput;
            case 'input[data-testid="vat"]':
              return mockVatInput;
            case 'input[data-testid="pct"]':
              return {
                value: "20",
              };
            case 'textarea[data-testid="commentary"]':
              return mockCommentaryInput;
            case 'input[data-testid="file"]':
              return mockFileInput;
          }
        }),
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document: document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage: mockLocalStorage,
      });

      await newBill.handleSubmit({ preventDefault: jest.fn() });

      expect(mockStore.bills().create).toHaveBeenCalledTimes(1);
      expect(mockStore.bills().create).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: {
          noContentType: true,
        },
      });

      expect(mockStore.bills().update).toHaveBeenCalledTimes(1);
      expect(mockStore.bills().update).toHaveBeenCalledWith({
        data: expect.any(String),
        selector: 1,
      });

      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
      expect(mockOnNavigate).toHaveBeenCalledWith("/bills");
    });
  });
});
