import api, { ApiError } from '../../../src/common/services/api.service';
import session from '../../../src/common/services/session.service';
import abortableFetch, {abort} from '../../../src/common/helpers/abortableFetch';
import { MINDS_API_URI } from '../../../src/config/Config';
import { UserError } from '../../../src/common/UserError';
jest.mock('../../../src/common/services/session.service');
jest.mock('../../../src/common/helpers/abortableFetch');

/**
 * POST
 */
describe('api service POST', () => {
  beforeEach(() => {
    abortableFetch.mockClear();
    session.login.mockClear();
  });

  it('should fetch and return json decoded', async () => {

    const response = { json: jest.fn(), ok: true };
    const respBody = {access_token: 'a1', user_id: 1000, status:'success'};
    response.json.mockResolvedValue(respBody);
    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    const res = await api.post('api/path', params);

    // assert on the response
    expect(res).toEqual(respBody);
    // call fetch post one time
    expect(abortableFetch.mock.calls.length).toEqual(1)
    expect(abortableFetch.mock.calls[0][0]).toContain(MINDS_API_URI+'api/path')
    expect(abortableFetch.mock.calls[0][1].method).toEqual('POST');
    expect(abortableFetch.mock.calls[0][1].body).toEqual(JSON.stringify(params));
  });

  it('should return server error', async () => {
    const response = {
      json: jest.fn(),
      ok: false,
      body: 'some error',
      status: 500,
    };

    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.post('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });

  it('should return json error', async () => {
    const response = {
      json: jest.fn(),
      text: jest.fn(),
      ok: false,
      body: 'some error',
      status: 200,
    };

    response.json.mockRejectedValue(new Error('Invalid JSON'));

    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.post('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(UserError);
    }
  });

  it('should return api error', async () => {

    const response = { json: jest.fn(), ok: true };
    const respBody = { status: 'error', error: 'some error' };
    response.json.mockResolvedValue(respBody);
    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.post('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });
});

/**
 * GET
 */
describe('api service GET', () => {
  beforeEach(() => {
    abortableFetch.mockClear();
    session.login.mockClear();
  });
  it('should fetch and return json decoded', async () => {

    const response = { json: jest.fn(), ok: true };
    const respBody = {access_token: 'a1', user_id: 1000, status:'success'};
    response.json.mockResolvedValue(respBody);
    const params = {p1: '1', p2: '2'};

    abortableFetch.mockResolvedValue(response);

    const res = await api.get('api/path', params, null);
    // assert on the response
    expect(res).toEqual(respBody);
    // call fetch get one time
    expect(abortableFetch.mock.calls.length).toEqual(1)
    expect(abortableFetch.mock.calls[0][0]).toContain(MINDS_API_URI+'api/path?p1=1&p2=2');
  });

  it('should return servers error', async () => {

    const response = { json: jest.fn(), ok: false, body: 'some error' };

    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.get('api/path', params, null);
    } catch (err){
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });

  it('should return api error', async () => {

    const response = { json: jest.fn(), ok: true };
    const respBody = { status: 'error', error: 'some error' };
    response.json.mockResolvedValue(respBody);
    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.get('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });
});

/**
 * DELETE
 */
describe('api service DELETE', () => {
  beforeEach(() => {
    abortableFetch.mockClear();
    session.login.mockClear();
  });
  it('should fetch and return json decoded', async () => {

    const response = { json: jest.fn(), ok: true };
    const respBody = {access_token: 'a1', user_id: 1000, status:'success'};
    response.json.mockResolvedValue(respBody);
    const params = {p1: '1', p2: '2'};

    abortableFetch.mockResolvedValue(response);

    const res = await api.delete('api/path', params);

    // assert on the response
    expect(res).toEqual(respBody);
    // call fetch delete one time
    expect(abortableFetch.mock.calls.length).toEqual(1)
    expect(abortableFetch.mock.calls[0][0]).toContain(MINDS_API_URI+'api/path')
    expect(abortableFetch.mock.calls[0][1].method).toEqual('DELETE');
    expect(abortableFetch.mock.calls[0][1].body).toEqual(JSON.stringify(params));
  });

  it('should return server error', async () => {

    const response = { json: jest.fn(), ok: false, body: 'some error' };

    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.delete('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });

  it('should return api error', async () => {

    const response = { json: jest.fn(), ok: true };
    const respBody = { status: 'error', error: 'some error' };
    response.json.mockResolvedValue(respBody);
    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.delete('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });
});

/**
 * PUT
 */
describe('api service PUT', () => {
  beforeEach(() => {
    abortableFetch.mockClear();
    session.login.mockClear();
  });
  it('should fetch and return json decoded', async () => {

    const response = { json: jest.fn(), ok: true };
    const respBody = {access_token: 'a1', user_id: 1000, status:'success'};
    response.json.mockResolvedValue(respBody);
    const params = {p1: '1', p2: '2'};

    abortableFetch.mockResolvedValue(response);

    const res = await api.put('api/path', params);

    // assert on the response
    expect(res).toEqual(respBody);
    // call fetch put one time
    expect(abortableFetch.mock.calls.length).toEqual(1)
    expect(abortableFetch.mock.calls[0][0]).toContain(MINDS_API_URI+'api/path')
    expect(abortableFetch.mock.calls[0][1].method).toEqual('PUT');
    expect(abortableFetch.mock.calls[0][1].body).toEqual(JSON.stringify(params));
  });

  it('should return server error', async () => {

    const response = { json: jest.fn(), ok: false, body: 'some error' };

    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.put('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });

  it('should return api error', async () => {
    const response = { json: jest.fn(), ok: true };
    const respBody = { status: 'error', error: 'some error' };
    response.json.mockResolvedValue(respBody);
    const params = {p1: 1, p2: 2};

    abortableFetch.mockResolvedValue(response);

    try {
      const res = await api.put('api/path', params);
    } catch (err) {
      // assert on the error
      expect(err).toBeInstanceOf(ApiError);
    }
  });
});

