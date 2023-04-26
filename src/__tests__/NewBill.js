/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

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
// describe("When...", () => {
//   let instance;
//   let html;

//   beforeAll(() => {
//     html = NewBillUI();
//     document.body.innerHTML = html;

//     instance = new NewBill({
//       document: document,
//       onNavigate: jest.fn(),
//       store: mockStore,
//       localStorage: {},
//     });

//     window.localStorage.setItem(
//       "user",
//       JSON.stringify({
//         type: "Employee",
//         email: "a@a",
//       })
//     );
//   });

//   test("Then I fill the rest of the form and click on submit the form is sumbmitted", async () => {
//     // Arrange
//     const formName = screen.getByTestId("expense-name");
//     const formDate = screen.getByTestId("datepicker");
//     const formAmount = screen.getByTestId("amount");
//     const formVat = screen.getByTestId("vat");
//     const formPct = screen.getByTestId("pct");
//     const formExpense = screen.getByTestId("expense-type");
//     const formBtn = screen.getByText("Envoyer");

//     const form = screen.getByTestId("form-new-bill");

//     formName.value = "Vol Paris St Malo";
//     formAmount.value = "175";
//     formVat.value = "20";
//     formPct.value = "20";
//     formDate.value = "2023-04-26";
//     userEvent.selectOptions(formExpense, ["Transports"]);

//     // Act

//     // Assert
//     expect(formBtn).toBeTruthy();
//     expect(formDate.value).toBe("2023-04-26");

//     const testHandleSubmit = jest.fn((e) => instance.handleSubmit(e));
//     form.addEventListener("submit", testHandleSubmit);

//     userEvent.click(formBtn);

//     expect(testHandleSubmit).toHaveBeenCalled();

//     // await waitFor(() => screen.getByText("Mes notes de frais"));
//     // const pageBill = screen.getByText("Mes notes de frais");
//     // expect(pageBill).toBeTruthy();
//   });
// });

// test d'intégration POST

describe("NewBill", () => {
  describe("handleSubmit", () => {
    it("should create a new bill", async (done) => {
      const html = NewBillUI();
      document.body.innerHTML = html;

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

      // create a new instance of NewBill
      const instance = new NewBill({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // fill the form fields
      const form = document.querySelector(`form[data-testid="form-new-bill"]`);
      form.querySelector(`input[data-testid="expense-name"]`).value =
        "Test expense";
      form.querySelector(`input[data-testid="amount"]`).value = "100";
      form.querySelector(`select[data-testid="expense-type"]`).value =
        "Transports";
      form.querySelector(`input[data-testid="datepicker"]`).value =
        "2023-04-26";
      form.querySelector(`input[data-testid="vat"]`).value = "20";
      form.querySelector(`textarea[data-testid="commentary"]`).value =
        "Test commentary";

      // Create a mock event to pass to handleSubmit
      const event = {
        preventDefault: jest.fn(),

        target: form,
      };

      // submit the form
      // form.dispatchEvent(new Event("submit"));
      instance.handleSubmit(event);

      const result = await instance.store.bills().list();
      // assert that FormData has been called with the expected arguments
      expect(result).toHaveBeenCalledTimes(1);
      expect(appendMock).toHaveBeenCalledTimes(2);
      expect(appendMock).toHaveBeenCalledWith("file", undefined);
      expect(appendMock).toHaveBeenCalledWith("email", "test@example.com");

      // assert that bills API create method has been called with the expected arguments
      expect(billsMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: {
          noContentType: true,
        },
      });

      // wait for the promise to be resolved
      setTimeout(() => {
        // assert that billId, fileUrl and fileName have been set
        expect(newBill.billId).toEqual("123");
        expect(newBill.fileUrl).toEqual("http://example.com");
        expect(newBill.fileName).toEqual("test.jpg"); // assuming a file with the name "test.jpg" was selected
        done();
      }, 0);
    });
  });
});
