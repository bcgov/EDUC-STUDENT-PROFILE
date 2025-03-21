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
  uploadFile
} from '../components/requestHandler.js';

import { forwardGetReq, isValidUUIDParam } from '../components/utils.js';
import config from '../config/index.js';
import {
  verifyPenRequestStatus,
  createPenRequestCommentPayload,
  createPenRequestCommentEvent
} from '../components/penRequest.js';
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

const requestType = 'penRequest';

const verifyPenRequest = verifyRequest(requestType);

router.post('/requests', passport.authenticate('jwt', {session: false}), isValidBackendToken, submitRequest(requestType, verifyPenRequestStatus));

router.get('/codes', passport.authenticate('jwt', {session: false}), isValidBackendToken, getCodes(requestType));

router.get('/document-type-codes', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('penRequest:apiEndpoint') + '/document-types')
);

router.get('/file-requirements', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  (req, res) => forwardGetReq(req, res, config.get('penRequest:apiEndpoint') + '/file-requirements')
);

router.post('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyPenRequest, uploadFile(requestType)]);

router.get('/requests/:id/documents', passport.authenticate('jwt', {session: false}), isValidBackendToken, verifyPenRequest,
  isValidUUIDParam('id'), (req, res) => forwardGetReq(req, res, `${config.get('penRequest:apiEndpoint')}/${req.params.id}/documents`)
);

router.get('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  verifyPenRequest, isValidUUIDParam('id'), isValidUUIDParam('documentId'), (req, res) =>
    forwardGetReq(req, res, `${config.get('penRequest:apiEndpoint')}/${req.params.id}/documents/${req.params.documentId}`)
);
// special case this does not use frontend axios, so need to refresh here to handle expired jwt.
router.get('/requests/:id/documents/:documentId/download', auth.refreshJWT, isValidBackendToken,
  isValidUUIDParam('id'), isValidUUIDParam('documentId'), [verifyPenRequest, downloadFile(requestType)]);

router.delete('/requests/:id/documents/:documentId', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), isValidUUIDParam('documentId'), [verifyPenRequest, deleteDocument(requestType)]);

router.get('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyPenRequest, getComments(requestType)]);

router.post('/requests/:id/comments', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [
    verifyPostCommentRequest(requestType),
    postComment(requestType, createPenRequestCommentPayload, createPenRequestCommentEvent)
  ]);

router.post('/requests/:id/verification-email', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyPenRequest, resendVerificationEmail(requestType)]);

router.patch('/requests/:id', passport.authenticate('jwt', {session: false}), isValidBackendToken,
  isValidUUIDParam('id'), [verifyPenRequest, setRequestAsSubsrev(requestType)]);

router.get('/verification', verifyEmail(requestType));

export default router;
