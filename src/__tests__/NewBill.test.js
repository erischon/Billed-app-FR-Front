import { screen, fireEvent } from "@testing-library/dom";

import NewBillUI from "../views/NewBillUI";
import NewBill from "../containers/NewBill";

import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage";

describe("Given I am connected as an employee and I am on Newbill Page", () => {
  let html;
  let newBillInstance;

  beforeAll(() => {
    // Set up a browser environment
    html = NewBillUI();
    document.body.innerHTML = html;

    // Create a new instance of NewBill
    newBillInstance = new NewBill({
      document: document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: {},
    });

    // Mock the localStorage
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "employee@billed.com",
      })
    );
  });

  it("should display a personal form.", () => {
    // display the form
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();

    // for me
    expect(JSON.parse(localStorage.getItem("user")).email).toBe(
      "employee@billed.com"
    );
  });

  describe("When I fill in all the information on the form", () => {
    let inputData;

    beforeAll(async () => {
      // I retrieve the list of mocked invoices
      const data = await mockStore.bills().list();

      // I create an object with the data of the first invoice
      inputData = {
        type: data[0].type,
        name: data[0].name,
        amount: data[0].amount.toString(),
        date: data[0].date,
        vat: data[0].vat,
        pct: data[0].pct.toString(),
        commentary: data[0].commentary,
        fileUrl: data[0].fileUrl,
        fileName: data[0].fileName,
        status: data[0].status,
      };
    });

    test("Then the values I filled are in the right place", () => {
      // Arrange
      const inputType = screen.getByTestId("expense-type");
      const inputName = screen.getByTestId("expense-name");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVat = screen.getByTestId("vat");
      const inputPct = screen.getByTestId("pct");
      const inputCommentary = screen.getByTestId("commentary");

      // Act
      fireEvent.change(inputType, { target: { value: inputData.type } });
      fireEvent.change(inputName, { target: { value: inputData.name } });
      fireEvent.change(inputDate, { target: { value: inputData.date } });
      fireEvent.change(inputAmount, { target: { value: inputData.amount } });
      fireEvent.change(inputVat, { target: { value: inputData.vat } });
      fireEvent.change(inputPct, { target: { value: inputData.pct } });
      fireEvent.change(inputCommentary, {
        target: { value: inputData.commentary },
      });

      // Assert
      expect(inputType.value).toBe(inputData.type);
      expect(inputName.value).toBe(inputData.name);
      expect(inputDate.value).toBe(inputData.date);
      expect(inputAmount.value).toBe(inputData.amount);
      expect(inputVat.value).toBe(inputData.vat);
      expect(inputPct.value).toBe(inputData.pct);
      expect(inputCommentary.value).toBe(inputData.commentary);
    });
  });

  // describe("When I click on submit button", () => {
  //   test("Then it should handle the submit", () => {
  //     // Arrange
  //     jest.mock("../containers/NewBill", () => ({
  //       handleSubmit: jest.fn(),
  //     }));

  //     const button = screen.getByRole("submit");

  //     // Act
  //     fireEvent.click(button);

  //     // Assert
  //     expect(newBillInstance.handleSubmit).toHaveBeenCalled();
  //   });
  // });
});
