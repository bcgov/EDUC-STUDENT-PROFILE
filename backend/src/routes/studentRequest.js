import passport from 'passport';
import express from 'express';
import {
  getCodes,
  postComment,
  submitRequest,
  getComments,
  verifyEmail,
  setRequestAsSubsrev,
  resendVerificationEmail,
  verifyRequest,
  verifyPostCommentRequest,
  deleteDocument,
  downloadFile,
  uploadFile,
  uploadFileWithoutRequest,
  verifyDocumentId
} from '../components/requestHandler.js';

import { forwardGetReq, isValidUUIDParam } from '../components/utils.js';
import config from '../config/index.js';
import {
  verifyStudentRequestStatus,
  createStudentRequestCommentPayload,
  createStudentRequestCommentEvent
} from '../components/studentRequest.js';
import * as auth from '../components/auth.js';

const isValidBackendToken = auth.isValidBackendToken();
const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/requests',
      '/codes',
      '/document-type-codes',
      '/file-requirements',
      '/verification'
    ]
  });
});

const requestType = 'studentRequest';

const verifyStudentRequest = verifyRequest(requestType);

const verifyStudentRequestDocumentId = verifyDocumentId(requestType);

router.post('/requests', passport.authenticate('jwt', {session: false}), isValidBackendToken, submitRequest(requestType, verifyStudentRequestStatus));

router.get('/codes', passport.authenticate('jwt', {session: false}), isValidBackendToken, getCodes(requestType));

router.get('/document-type-codes', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('studentRequest:apiEndpoint') + '/document-types')
);

router.get('/file-requirements', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('studentRequest:apiEndpoint') + '/file-requirements')
);

router.post('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyStudentRequest, uploadFile(requestType)]);

router.post('/requests/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, uploadFileWithoutRequest(requestType));

router.get('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, 
  verifyStudentRequest, isValidUUIDParam('id'),
  (req, res) => forwardGetReq(req, res, `${config.get('studentRequest:apiEndpoint')}/${req.params.id}/documents`)
);

router.get('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  verifyStudentRequest, isValidUUIDParam('id'), isValidUUIDParam('documentId'),
  (req, res) => forwardGetReq(req, res, `${config.get('studentRequest:apiEndpoint')}/${req.params.id}/documents/${req.params.documentId}`)
);
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/requests/:id/documents/:documentId/download', auth.refreshJWT, isValidBackendToken,
  isValidUUIDParam('id'), isValidUUIDParam('documentId'), [verifyStudentRequest, downloadFile(requestType)]);

router.get('/requests/documents/:documentId/download', auth.refreshJWT, isValidBackendToken,
  isValidUUIDParam('documentId'), [verifyStudentRequestDocumentId, downloadFile(requestType)]);

router.delete('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), isValidUUIDParam('documentId'), [verifyStudentRequest, deleteDocument(requestType)]);

router.delete('/requests/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('documentId'), [verifyStudentRequestDocumentId, deleteDocument(requestType)]);

router.get('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyStudentRequest, getComments(requestType)]);

router.post('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [
    verifyPostCommentRequest(requestType),
    postComment(requestType, createStudentRequestCommentPayload, createStudentRequestCommentEvent)
  ]);

router.post('/requests/:id/verification-email', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyStudentRequest, resendVerificationEmail(requestType)]);

router.patch('/requests/:id', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyStudentRequest, setRequestAsSubsrev(requestType)]);

router.get('/verification', verifyEmail(requestType));

export default router;
