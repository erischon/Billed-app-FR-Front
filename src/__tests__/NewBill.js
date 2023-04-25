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
    test("should prevent the default form submission behavior", () => {
      // Arrange
      const event = {
        preventDefault: jest.fn(),

        target: {
          querySelector: jest.fn(() => ({
            value: "",
          })),
        },
      };

      const newBill = new NewBill({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: {},
      });

      // Act
      newBill.handleSubmit(event);

      // Assert
      expect(event.preventDefault).toHaveBeenCalled();
    });

    // test("should update the bill", () => {
    //   // Arrange
    //   const email = "test@test.com";
    //   const expenseType = "Type";
    //   const expenseName = "Name";
    //   const amount = "100";
    //   const datepicker = "2022-05-01";
    //   const vat = "20";
    //   const pct = "20";
    //   const commentary = "Commentary";
    //   const fileUrl = "http://test.com/image.png";
    //   const fileName = "image.png";
    //   const event = {
    //     preventDefault: jest.fn(),
    //     target: {
    //       querySelector: jest.fn((selector) => {
    //         switch (selector) {
    //           case 'select[data-testid="expense-type"]':
    //             return { value: expenseType };
    //           case 'input[data-testid="expense-name"]':
    //             return { value: expenseName };
    //           case 'input[data-testid="amount"]':
    //             return { value: amount };
    //           case 'input[data-testid="datepicker"]':
    //             return { value: datepicker };
    //           case 'input[data-testid="vat"]':
    //             return { value: vat };
    //           case 'input[data-testid="pct"]':
    //             return { value: pct };
    //           case 'textarea[data-testid="commentary"]':
    //             return { value: commentary };
    //         }
    //       }),
    //     },
    //   };
    //   const store = {
    //     bills: jest.fn(() => ({
    //       update: jest.fn(),
    //     })),
    //   };
    //   const onNavigate = jest.fn();
    //   const newBill = new NewBill({
    //     store,
    //     onNavigate,
    //   });
    //   newBill.fileUrl = fileUrl;
    //   newBill.fileName = fileName;

    //   // Act
    //   newBill.handleSubmit(event);

    //   // Assert
    //   expect(store.bills().update).toHaveBeenCalledWith({
    //     data: JSON.stringify({
    //       email,
    //       type: expenseType,
    //       name: expenseName,
    //       amount: parseInt(amount),
    //       date: datepicker,
    //       vat,
    //       pct: parseInt(pct),
    //       commentary,
    //       fileUrl,
    //       fileName,
    //       status: "pending",
    //     }),
    //     selector: newBill.billId,
    //   });
    //   expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
    // });
  });
});

describe("NewBill 2", () => {
  describe("handleChangeFile", () => {
    let storeMock;
    let newBill;

    beforeEach(() => {
      storeMock = {
        bills: jest.fn(() => ({
          create: jest.fn(() =>
            Promise.resolve({
              fileUrl: "https://example.com/image.jpg",
              key: "123456789",
            })
          ),
        })),
      };

      const documentMock = {
        querySelector: jest.fn((selector) => {
          if (selector === 'form[data-testid="form-new-bill"]') {
            return {
              addEventListener: jest.fn(),
            };
          } else if (selector === 'input[data-testid="file"]') {
            return {
              addEventListener: jest.fn(),
              files: [new File([], "test.jpg")],
              value: "C:\\fakepath\\test.jpg",
            };
          }
        }),
      };

      newBill = new NewBill({
        document: documentMock,
        store: storeMock,
        onNavigate: () => {},
        localStorage: {
          getItem: jest.fn(() =>
            JSON.stringify({
              email: "user@example.com",
            })
          ),
        },
      });
    });

    test("should call store.bills().create() with the right arguments", () => {
      const formDataMock = new FormData();
      formDataMock.append("file", new File([], "test.jpg"));
      formDataMock.append("email", "user@example.com");

      const expectedData = {
        data: formDataMock,
        headers: {
          noContentType: true,
        },
      };

      return newBill.handleChangeFile(new Event("change")).then(() => {
        expect(storeMock.bills().create).toHaveBeenCalledWith(expectedData);
      });
    });

    test("should update fileUrl, fileName and billId when store.bills().create() resolves", () => {
      return newBill.handleChangeFile(new Event("change")).then(() => {
        expect(newBill.fileUrl).toBe("https://example.com/image.jpg");
        expect(newBill.fileName).toBe("test.jpg");
        expect(newBill.billId).toBe("123456789");
      });
    });

    test("should log an error when store.bills().create() rejects", () => {
      storeMock
        .bills()
        .create.mockImplementationOnce(() => Promise.reject("error"));
      console.error = jest.fn();

      return newBill.handleChangeFile(new Event("change")).then(() => {
        expect(console.error).toHaveBeenCalledWith("error");
      });
    });
  });
});
