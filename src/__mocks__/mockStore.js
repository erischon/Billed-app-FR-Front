class MockApiEntity {
  constructor({ key, api }) {
    this.key = key;
    this.api = api;
  }

  async select({ selector, headers = {} }) {
    return { message: "Mocked response from select" };
  }

  async list({ headers = {} } = {}) {
    return { message: "Mocked response from list" };
  }

  async update({ data, selector, headers = {} }) {
    return { message: "Mocked response from update" };
  }

  async create({ data, headers = {} }) {
    return { message: "Mocked response from create" };
  }

  async delete({ selector, headers = {} }) {
    return { message: "Mocked response from delete" };
  }
}

class MockApi {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  async get({ url, headers }) {
    return { message: "Mocked response from get" };
  }

  async post({ url, data, headers }) {
    return { message: "Mocked response from post" };
  }

  async delete({ url, headers }) {
    return { message: "Mocked response from delete" };
  }

  async patch({ url, data, headers }) {
    return { message: "Mocked response from patch" };
  }
}

class MockStore {
  constructor() {
    this.api = new MockApi({ baseUrl: "http://localhost:5678" });
  }

  user = (uid) =>
    new MockApiEntity({ key: "users", api: this.api }).select({
      selector: uid,
    });

  users = () => new MockApiEntity({ key: "users", api: this.api });

  login = (data) => ({ message: "Mocked response from login" });

  ref = (path) => this.store.doc(path);

  bill = (bid) =>
    new MockApiEntity({ key: "bills", api: this.api }).select({
      selector: bid,
    });

  bills = () => new MockApiEntity({ key: "bills", api: this.api });
}

export default new MockStore();
