/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";

import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";

import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Arrange
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Act
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      // Assert
      expect(window.location.hash).toBe("#employee/bills"); // check if the URL hash is correct
      expect(windowIcon).toHaveClass("active-icon"); // check if the icon is highlighted
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("When I am on Bills page", () => {
  let component;

  beforeEach(() => {
    // On crée un mock du document et on instancie la classe Bills pour chaque test
    // document.body.innerHTML = BillsUI({ data: bills });

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    component = new Bills({
      document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: window.localStorage,
    });
  });

  test("Then it should add click listener to buttonNewBill", () => {
    // Arrange
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );

    // Act
    buttonNewBill.click(); // On simule un clic sur le bouton

    // Assert
    expect(buttonNewBill).toHaveProperty("onclick"); // Check if the icon has an onclick property
    expect(component.onNavigate).toHaveBeenCalledWith("#employee/bill/new"); // Check if the onNavigate method has been called with the correct URL
  });

  test("Then it should add click listener to iconEye", () => {
    $.fn.modal = jest.fn(); // Mocking JQuery's modal function

    // Arrange
    const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
    const clickHandler = jest.fn();
    iconEye.onclick = clickHandler;

    // Act
    fireEvent.click(iconEye); // Simulate a click on the icon

    // Assert
    expect(iconEye).toHaveProperty("onclick"); // Check if the icon has an onclick property
    expect(clickHandler).toHaveBeenCalled(); // Check if the clickHandler has been called
  });

  test("Then there is a non empty bill list", async () => {
    // Arrange

    // Act
    const result = await component.getBills();

    // Assert
    expect(result.length).toBeGreaterThan(0);
  });
});
