import { vi } from 'vitest';

export const mockRequest = (body, session = {}, params = {}, query = {}) => {
  return {
    body,
    session,
    params,
    query,
  };
};

export const mockResponse = (data = {}) => {
  const res = {data};
  res.status = vi.fn().mockImplementation(v => {
    res.data.status = v;
    return res;
  });
  res.json = vi.fn().mockImplementation(v => {
    res.data.json = v;
    return res;
  });
  res.redirect = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockImplementation(v => {
    res.data.raw = v;
    return res;
  });
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
};
