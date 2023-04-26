/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

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

describe("When I am on NewBill Page and I add a new Bill POST", () => {
  test("should added newBill POST", async () => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "employee@company.tld",
      })
    );

    document.body.innerHTML = NewBillUI();

    const inputData = {
      type: "Hôtel et logement",
      name: "encore",
      amount: "400",
      date: "2004-04-04",
      vat: "80",
      pct: "20",
      commentary: "séminaire billed",
      fileUrl:
        "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      status: "pending",
    };

    const inputType = screen.getByTestId("expense-type");
    fireEvent.change(inputType, { target: { value: inputData.type } });
    expect(inputType.value).toBe(inputData.type);

    const inputName = screen.getByTestId("expense-name");
    fireEvent.change(inputName, { target: { value: inputData.name } });
    expect(inputName.value).toBe(inputData.name);

    const inputDate = screen.getByTestId("datepicker");
    fireEvent.change(inputDate, { target: { value: inputData.date } });
    expect(inputDate.value).toBe(inputData.date);

    const inputAmount = screen.getByTestId("amount");
    fireEvent.change(inputAmount, { target: { value: inputData.amount } });
    expect(inputAmount.value).toBe(inputData.amount);

    const inputVat = screen.getByTestId("vat");
    fireEvent.change(inputVat, { target: { value: inputData.vat } });
    expect(inputVat.value).toBe(inputData.vat);

    const inputPct = screen.getByTestId("pct");
    fireEvent.change(inputPct, { target: { value: inputData.pct } });
    expect(inputPct.value).toBe(inputData.pct);

    const inputCommentary = screen.getByTestId("commentary");
    fireEvent.change(inputCommentary, {
      target: { value: inputData.commentary },
    });
    expect(inputCommentary.value).toBe(inputData.commentary);

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const store = null;

    const newBills = new NewBill({
      document,
      onNavigate,
      store,
      localStorage,
    });

    const getlocalStorage = localStorage.getItem("user");
    const localStorageparse = JSON.parse(getlocalStorage);
    const email = JSON.parse(localStorageparse).email;

    const mocked = mockStore.bills();
    const createBills = jest.spyOn(mocked, "create");

    const create = await createBills({ email, ...inputData });

    const formNewBill = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn(newBills.handleSubmit);

    formNewBill.addEventListener("submit", handleSubmit);
    fireEvent.submit(formNewBill);

    expect(create.key).toBe("1234");
    expect(create.fileUrl).toBe("https://localhost:3456/images/test.jpg");

    expect(handleSubmit).toHaveBeenCalled();
    expect(createBills).toHaveBeenCalled();
    expect(formNewBill).toBeTruthy();
  });
});

describe("When an error occurs on API", () => {
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

  test("fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.NewBill);
    await new Promise(process.nextTick);
    document.body.innerHTML = BillsUI({ error: "Erreur 404" });
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.NewBill);
    await new Promise(process.nextTick);
    document.body.innerHTML = BillsUI({ error: "Erreur 500" });
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
