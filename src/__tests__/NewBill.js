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
        store: mockStore,
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

    describe("When I click on Submit", () => {
      test("Then it handle the event", () => {
        // Arrange
        const event = {
          preventDefault: jest.fn(),

          target: {
            querySelector: jest.fn(() => ({
              value: "",
            })),
          },
        };

        // Act
        instance.handleSubmit(event);

        // Assert
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

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

      test("Then it should load the image", () => {
        // Arrange
        const fakeEvent = {
          preventDefault: jest.fn(),
          target: {
            value: "image.jpg",
          },
        };

        // Act
        instance.handleChangeFile(fakeEvent);

        // Assert
        expect(fakeEvent.target.value).toBe("image.jpg");
      });
    });
  });
});

//
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill Page", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from mock API GET", async () => {
      // Arrange
      const store = await mockStore.bills().list();

      // Act
      window.onNavigate(ROUTES_PATH.Bills);
      const resultType = screen.getByText(store[0].type);
      const resultName = screen.getByText(store[0].name);

      // Assert
      expect(store[0].type).toBeTruthy();
      expect(store[0].name).toBeTruthy();
    });

    describe("When an error occurs on API", () => {
      test("fetches bills from an API and fails with 404 message error", async () => {
        // Arrange
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        // Act
        window.onNavigate(ROUTES_PATH.Dashboard);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);

        // Assert
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        // Arrange
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        // Act
        window.onNavigate(ROUTES_PATH.Dashboard);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);

        // Assert
        expect(message).toBeTruthy();
      });
    });
  });
});
