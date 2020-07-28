'use strict';

const passport = require('passport');
const express = require('express');
const { getCodes, submitRequest, getComments, verifyEmail, setRequestAsSubsrev, resendVerificationEmail, verifyRequest, deleteDocument, downloadFile, uploadFile } = require('../components/request');
const { forwardGetReq } = require('../components/utils');
const config = require('../config/index');
const { verifyStudentRequestStatus, postComment } = require('../components/studentRequest');

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

router.post('/requests', passport.authenticate('jwt', { session: false }), submitRequest(requestType, verifyStudentRequestStatus));

router.get('/codes', passport.authenticate('jwt', { session: false }), getCodes(requestType));

router.get('/document-type-codes', passport.authenticate('jwt', { session: false }),
  (req, res) => forwardGetReq(req, res, config.get('studentRequest:apiEndpoint') + '/document-types')
);

router.get('/file-requirements', passport.authenticate('jwt', { session: false }),
  (req, res) => forwardGetReq(req, res, config.get('studentRequest:apiEndpoint') + '/file-requirements')
);

router.post('/requests/:id/documents', passport.authenticate('jwt', { session: false }), [verifyStudentRequest, uploadFile(requestType)]);

router.get('/requests/:id/documents', passport.authenticate('jwt', { session: false }), verifyStudentRequest, 
  (req, res) => forwardGetReq(req, res, `${config.get('studentRequest:apiEndpoint')}/${req.params.id}/documents`)
);

router.get('/requests/:id/documents/:documentId', passport.authenticate('jwt', { session: false }), verifyStudentRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('studentRequest:apiEndpoint')}/${req.params.id}/documents/${req.params.documentId}`)
);

router.get('/requests/:id/documents/:documentId/download/:fileName', [verifyStudentRequest, downloadFile(requestType)]);

router.delete('/requests/:id/documents/:documentId', passport.authenticate('jwt', { session: false }), [verifyStudentRequest, deleteDocument(requestType)]);

router.get('/requests/:id/comments', passport.authenticate('jwt', { session: false }), [verifyStudentRequest, getComments(requestType)]);

router.post('/requests/:id/comments', passport.authenticate('jwt', { session: false }), [verifyStudentRequest, postComment]);

router.post('/requests/:id/verification-email', passport.authenticate('jwt', { session: false }), [verifyStudentRequest, resendVerificationEmail(requestType)]);

router.patch('/requests/:id', passport.authenticate('jwt', { session: false }), [verifyStudentRequest, setRequestAsSubsrev(requestType)]);

router.get('/verification', verifyEmail(requestType));

module.exports = router;
