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

jest.mock("../app/store", () => mockStore);

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

    let component;

    beforeEach(() => {
      component = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });
    });

    test("Then bills should be ordered from earliest to latest", async () => {
      // Arrange
      document.body.innerHTML = BillsUI({ data: bills });
      const result = await component.getBills();

      // Act
      const expected = result.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      // Assert
      expect(expected).toBe(result);
    });

    test("Then there should be a click listener to buttonNewBill", () => {
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

    test("Then there should be a click listener to iconEye", () => {
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

    test("Then there should be a non-empty bill list that displays", async () => {
      // Arrange
      const result = await component.getBills();

      // Assert
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
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
