'use strict';

const passport = require('passport');
const express = require('express');
const { getUserInfo, getCodes, submitRequest, getComments, postComment, verifyEmail, setRequestAsSubsrev, resendVerificationEmail, getRequest, deleteDocument, downloadFile, uploadFile } = require('../components/request');
const { forwardGetReq } = require('../components/utils');
const config = require('../config/index');

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/request'
    ]
  });
});

router.get('/user', passport.authenticate('jwt', { session: false }), getUserInfo);

router.post('/request', passport.authenticate('jwt', { session: false }), submitRequest);

router.get('/codes', passport.authenticate('jwt', { session: false }), getCodes);

router.get('/document-type-codes', passport.authenticate('jwt', { session: false }),
  (req, res) => forwardGetReq(req, res, config.get('studentProfile:apiEndpoint') + '/document-types')
);

router.get('/file-requirements', passport.authenticate('jwt', { session: false }),
  (req, res) => forwardGetReq(req, res, config.get('studentProfile:apiEndpoint') + '/file-requirements')
);

router.post('/request/:id/documents', passport.authenticate('jwt', { session: false }), [getRequest, uploadFile]);

router.get('/request/:id/documents', passport.authenticate('jwt', { session: false }), getRequest, 
  (req, res) => forwardGetReq(req, res, `${config.get('studentProfile:apiEndpoint')}/${req.params.id}/documents`)
);

router.get('/request/:id/documents/:documentId', passport.authenticate('jwt', { session: false }), getRequest,
  (req, res) => forwardGetReq(req, res, `${config.get('studentProfile:apiEndpoint')}/${req.params.id}/documents/${req.params.documentId}`)
);

router.get('/request/:id/documents/:documentId/download/:fileName', [getRequest, downloadFile]);

router.delete('/request/:id/documents/:documentId', passport.authenticate('jwt', { session: false }), [getRequest, deleteDocument]);

router.get('/request/:id/comments', passport.authenticate('jwt', { session: false }), [getRequest, getComments]);

router.post('/request/:id/comments', passport.authenticate('jwt', { session: false }), [getRequest, postComment]);

router.post('/request/:id/verification-email', passport.authenticate('jwt', { session: false }), [getRequest, resendVerificationEmail]);

router.patch('/request/:id', passport.authenticate('jwt', { session: false }), [getRequest, setRequestAsSubsrev]);

router.get('/verification', verifyEmail);

module.exports = router;
