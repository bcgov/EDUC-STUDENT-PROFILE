import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HttpStatus from 'http-status-codes';
import config from '../../../src/config/index.js';
import * as utils from '../../../src/components/utils.js';
import * as requestHandler from '../../../src/components/requestHandler.js';
import { ServiceError } from '../../../src/components/error.js';
import { mockRequest, mockResponse } from '../helpers.js';
const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';

vi.mock('../../../src/components/auth.js');
vi.mock('../../../src/components/utils.js');

describe('uploadFile', () => {
  const document = {
    documentData: 'test data'
  };
  const postRes = {
    documentID: 'documentId',
  };
  const params = {
    id: 'd74a0213-9a70-4306-8765-37a72435de66',
  };
  const requestType = 'studentRequest';
  const session = {
    [requestType]: {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
    }
  };
  const uploadFileHandler = requestHandler.uploadFile(requestType);

  let req;
  let res;

  vi.spyOn(utils, 'getAccessToken');
  const spy = vi.spyOn(utils, 'postData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.postData.mockResolvedValue(postRes);
    res = mockResponse();
  });

  afterEach(() => {
  });

  it('should return response data', async () => {
    req = mockRequest(document, session, params);
    req.session.correlationID=correlationID;

    await uploadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(postRes);
    expect(spy).toHaveBeenCalledWith('token', document, `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents`, correlationID);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    req = mockRequest(document, session, params);
    req.session.correlationID=correlationID;

    utils.getAccessToken.mockReturnValue(null);

    await uploadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return CONFLICT if no request in the session', async () => {
    const session = {
      request: null,
    };

    req = mockRequest(document, session, params);
    req.session.correlationID=correlationID;

    req = mockRequest(document, session, params);

    await uploadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if request is not RETURNED', async () => {
    const session = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
    };

    req = mockRequest(document, session, params);
    req.session.correlationID=correlationID;

    await uploadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return BAD_REQUEST if request id is malformed', async () => {
    req = mockRequest(document, session, {...params, id: 'malformed'});
    req.session.correlationID=correlationID;

    await uploadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return INTERNAL_SERVER_ERROR if postData is failed', async () => {
    req = mockRequest(document, session, params);
    req.session.correlationID=correlationID;

    utils.postData.mockRejectedValue(new Error('test error'));

    await uploadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getDocument', () => {
  const documentData = { documentData: 'test data' };

  vi.spyOn(utils, 'getData');
  const requestID = 'requestId';
  const documentID = 'documentId';
  const includeDocData = 'Y';
  const token = 'token';
  const requestType = 'studentRequest';

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return document data', async () => {
    utils.getData.mockResolvedValue(documentData);
    const result = await requestHandler.getDocument(token, requestID, documentID, requestType, includeDocData);

    expect(result).toEqual(documentData);
    expect(utils.getData).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${requestID}/documents/${documentID}?includeDocData=${includeDocData}`);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(requestHandler.getDocument(token, requestID, documentID, requestType, includeDocData)).rejects.toThrowError(ServiceError);
  });
});

describe('deleteDocument', () => {
  const document = {
    documentData: 'test data',
    createDate: '2020-03-02T12:13:14'
  };
  const params = {
    id: '057ce5c1-1b82-45c9-8898-7f490325c291',
    documentId: 'dce4717a-5e9a-447f-b3df-51eb2fe236e7'
  };
  const requestType = 'studentRequest';
  const session = {
    [requestType]: {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
      statusUpdateDate: '2020-03-01T12:13:16'
    }
  };
  const deleteDocumentHandler = requestHandler.deleteDocument(requestType);

  let req;
  let res;

  const getDataSpy = vi.spyOn(utils, 'getData');
  const deleteDataSpy = vi.spyOn(utils, 'deleteData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(document);
    req = mockRequest(null, session, params);
    res = mockResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return OK', async () => {
    getDataSpy.mockResolvedValueOnce(document);

    await deleteDocumentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(utils.getData).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents/${params.documentId}?includeDocData=N`);
    expect(deleteDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents/${params.documentId}`);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);

    await deleteDocumentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return CONFLICT if no request in the session', async () => {
    const session = {
      request: null,
    };
    req = mockRequest(null, session, params);

    await deleteDocumentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if request is not RETURNED', async () => {
    const session = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
      statusUpdateDate: '2020-03-01T12:13:16'
    };
    req = mockRequest(null, session, params);

    await deleteDocumentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if document was uploaded before request was returned ', async () => {
    const session = {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
      statusUpdateDate: '2020-03-03T12:13:16'
    };
    req = mockRequest(null, session, params);

    await deleteDocumentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return BAD_REQUEST if id param is malformed', async () => {
    const theseParams = { ...params, id: 'not a UUID' };
    req = mockRequest(null, session, theseParams);

    await deleteDocumentHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD_REQUEST if documentId param is malformed', async () => {
    const theseParams = { ...params, documentId: 'not a UUID' };
    req = mockRequest(null, session, theseParams);

    await deleteDocumentHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return INTERNAL_SERVER_ERROR if deleteData is failed', async () => {
    utils.deleteData.mockRejectedValue(new Error('test error'));

    await deleteDocumentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('downloadFile', () => {
  const document = {
    documentData: 'dGVzdCBkYXRh',
    fileName: 'test.jpg',
    fileExtension: 'image/jpeg'
  };
  const params = {
    id: 'dca481a2-8f36-4994-8e2f-2c95e1219223',
    documentId: '1adbe2f3-cde8-4400-86e8-c2ddef4ea720'
  };
  const downloadFileHandler = requestHandler.downloadFile('studentRequest');

  let req;
  let res;

  vi.spyOn(utils, 'getAccessToken');
  const getDataSpy = vi.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(document);
    res = mockResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return OK and document data', async () => {
    req = mockRequest(null, null, params);
    await downloadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.data.raw.toString()).toEqual('test data');
    expect(res.setHeader).toHaveBeenNthCalledWith(1, 'Content-disposition', 'attachment; filename=' + document.fileName);
    expect(res.setHeader).toHaveBeenNthCalledWith(2, 'Content-type', document.fileExtension);
    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents/${params.documentId}?includeDocData=Y`);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    req = mockRequest(null, null, params);
    utils.getAccessToken.mockReturnValue(null);

    await downloadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return BAD_REQUEST if request id is malformed', async () => {
    req = mockRequest(null, null, {...params, id: 'malformed'});

    await downloadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD_REQUEST if documentId is malformed', async () => {
    req = mockRequest(null, null, {...params, documentId: 'malformed'});

    await downloadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return INTERNAL_SERVER_ERROR if deleteData is failed', async () => {
    req = mockRequest(null, null, params);
    utils.getData.mockRejectedValue(new Error('test error'));

    await downloadFileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
