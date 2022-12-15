const UserController = require('./../controllers/users')
const AuthController  = require('./../controllers/auth')
const SubmissionKategoriController  = require('./../controllers/submission-category')
const ProductKategoriController  = require('./../controllers/product-category')
const WalletController  = require('./../controllers/wallet')
const CompanyController = require('./../controllers/company')
const SubmissionController = require('./../controllers/submission')
const ItemController = require('./../controllers/items')
const TransactionController = require('./../controllers/transactions')
const AttachmentSubmissionController = require('./../controllers/submission-attachment')
const ProductController  = require('./../controllers/products')
const router = require('express').Router();
const multer = require('multer')
const os = require('os')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { decodeToken } = require('./../controllers/middleware');

//auth
passport.use(new LocalStrategy({usernameField: 'email'}, AuthController.localStartegy));
router.post('/login', multer().none(), AuthController.login)
router.post('/logout', [multer().none(), decodeToken()], AuthController.logout)
router.get('/me', [multer().none(), decodeToken()], AuthController.me)

//users
router.get('/users', [multer().none(), decodeToken()], UserController.index)
router.post('/users', [multer({dest: os.tmpdir()}).single('imageUser')], UserController.store)
router.put('/users/:id', [multer({dest: os.tmpdir()}).single('imageUser'), decodeToken()], UserController.update)
router.delete('/users/:id', [multer().none(), decodeToken()], UserController.destroy)

//submission categories
router.get('/submission-categories', [multer().none(), decodeToken()], SubmissionKategoriController.index);
router.post('/submission-categories', [multer().none(), decodeToken()], SubmissionKategoriController.store);
router.put('/submission-categories/:id', [multer().none(), decodeToken()], SubmissionKategoriController.update);
router.delete('/submission-categories/:id', [multer().none(), decodeToken()], SubmissionKategoriController.destroy);
router.get('/get-submission-categories', [multer().none(), decodeToken()], SubmissionKategoriController.getCategorySubmission);

//product categories
router.get('/product-categories', [multer().none(), decodeToken()], ProductKategoriController.index);
router.post('/product-categories', [multer().none(), decodeToken()], ProductKategoriController.store);
router.put('/product-categories/:id', [multer().none(), decodeToken()], ProductKategoriController.update);
router.delete('/product-categories/:id', [multer().none(), decodeToken()], ProductKategoriController.destroy);

//wallets
router.get('/wallets', [multer().none(), decodeToken()], WalletController.index);
router.post('/wallets', [multer().none(), decodeToken()], WalletController.store);
router.put('/wallets/:id', [multer().none(), decodeToken()], WalletController.update);
router.delete('/wallets/:id', [multer().none(), decodeToken()], WalletController.destroy);

//company profile
router.get('/company-profile', [multer().none(), decodeToken()], CompanyController.index)
router.post('/company-profile', [multer({dest: os.tmpdir()}).single('companyLogo'), decodeToken()], CompanyController.store)
router.put('/company-profile/:id', [multer({dest: os.tmpdir()}).single('companyLogo'), decodeToken()], CompanyController.update);
// router.put('/users/:id', [multer({dest: os.tmpdir()}).single('imageUser'), decodeToken()], UserController.update)
// router.delete('/users/:id', [multer().none(), decodeToken()], UserController.destroy)

//submissoins
router.get('/submissions', [multer().none(), decodeToken()], SubmissionController.index)
router.post('/submissions', [multer().none(), decodeToken()], SubmissionController.create)
router.put('/submissions/:id', [multer().none(), decodeToken()], SubmissionController.update)
router.get('/submissions/:id', [multer().none(), decodeToken()], SubmissionController.show)
router.put('/submissions/:id', [multer().none(), decodeToken()], SubmissionController.update)
router.put('/submissions/update-status/:id', [multer().none(), decodeToken()], SubmissionController.updateStatus)
router.delete('/submissions/:id', [multer().none(), decodeToken()], SubmissionController.destroy)
router.put('/submissions/update-fullfilment/:id', [multer().none(), decodeToken()], SubmissionController.updateFullfilment)
router.put('/submission/updateCompleted/:id', [multer().none(), decodeToken()], SubmissionController.updateCompleted)

//laporan
router.post('/laporan', [multer().none(), decodeToken()], SubmissionController.laporan)

// items
router.get('/get-items', [multer().none(), decodeToken()], ItemController.getItems)
router.get('/items', [multer().none(), decodeToken()], ItemController.index)

//Transaction
router.get('/transactions', [multer().none(), decodeToken()], TransactionController.index)
router.post('/transactions', [multer({dest: os.tmpdir()}).single('attachmentTransaction'), decodeToken()], TransactionController.store)

//Attachment Submission
router.post('/attachment-submissions', [multer({dest: os.tmpdir()}).single('attachmentSubmissoin'), decodeToken()], AttachmentSubmissionController.store)

//Products
router.get('/products', [multer().none(), decodeToken()], ProductController.index);
router.post('/products', [multer({dest: os.tmpdir()}).single('photoProduct'), decodeToken()], ProductController.store)
router.delete('/products/:id', [multer().none(), decodeToken()], ProductController.destroy)


module.exports = router
