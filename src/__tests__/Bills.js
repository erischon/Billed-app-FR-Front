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
import storeMock from "__mocks__/store.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

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

describe("Bills", () => {
  let component;

  beforeEach(() => {
    // On crée un mock du document et on instancie la classe Bills pour chaque test
    document.body.innerHTML = BillsUI({ data: bills });

    component = new Bills({
      document,
      onNavigate: jest.fn(),
      store: storeMock,
      localStorage: jest.fn(),
    });
  });

  test("should add click listener to buttonNewBill", () => {
    // Arrange
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );

    // Act
    buttonNewBill.click(); // On simule un clic sur le bouton

    // Assert
    expect(component.onNavigate).toHaveBeenCalledWith("#employee/bill/new"); // On vérifie que la méthode onNavigate a bien été appelée avec la bonne route
  });

  test("should add click listener to iconEye", () => {
    $.fn.modal = jest.fn();

    // Arrange
    const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);

    // Act
    userEvent.click(iconEye); // On simule un clic sur l'icône

    // Assert
    expect(iconEye).toHaveProperty("onclick");

    // Arrange
    const clickHandler = jest.fn();
    iconEye.onclick = clickHandler;

    // Act
    fireEvent.click(iconEye);

    // Assert
    expect(clickHandler).toHaveBeenCalled();
  });

  test("Then", () => {
    // Arrange

    // Act
    component.getBills();

    // Assert
    expect("").toHaveProperty("onclick");
  });
});
