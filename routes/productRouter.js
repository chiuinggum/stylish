const express = require('express');
const router = express.Router();
const { uploadImages, createProduct, getProductDetailsById, listAllProducts, listMenProducts, listWomenProducts, searchProducts, deleteProduct, recoverProduct, listAccessoriesProducts } = require('../controllers/productController');

router.post('/create', uploadImages, createProduct);
// router.post('/update', );
router.get('/all', listAllProducts);
router.get('/men', listMenProducts);
router.get('/women', listWomenProducts);
router.get('/accessories', listAccessoriesProducts);
router.get('/search', searchProducts);
router.get('/details', getProductDetailsById);
router.get('/delete', deleteProduct);
router.get('/recover', recoverProduct);

module.exports = router;