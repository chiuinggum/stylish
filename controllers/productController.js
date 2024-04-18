
const { db, multerUpload } = require('../config');
const { createProductRecords, getProductById, getProductByPageAndCategory, getProductTotalNumber, formProductData, getProductsByKeyword, formMultipleProductData, deletProductById, recoverProductById } = require('../models/ProductModel');
const { createColorRecords, getColorByCode } = require('../models/ColorModel');
const { createVariantRecords, getVariantByProductId } = require('../models/VariantModel');
const { createImageRecords, getImagesByProductId } = require('../models/ImageModel');


class ProductController {
    static async uploadImages(req, res, next) {
        const upload = multerUpload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'images', maxCount: 10}]);
        upload(req, res, (err) => {
            if(err) {
                throw new Error('Error uploading images');
            }
            console.log('images uploaded');
            next();
        });
    };

    // static async uploadImages(req, res, next) {
    //     try {
    //         const upload = multerUpload.fields([
    //             { name: 'main_image', maxCount: 1 },
    //             { name: 'images', maxCount: 10 }
    //         ]);
    //         await new Promise((resolve, reject) => {
    //             upload(req, res, (err) => {
    //                 if (err) {
    //                     reject(err);
    //                 } else {
    //                     console.log('Images uploaded');
    //                     resolve();
    //                 }
    //             });
    //         });
    //         next();
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({ error: 'Error uploading images' });
    //     }
    // }
    
    static async createProduct(req, res, next) {
        const { colors, variants } = req.body;
        const main_image = req.files['main_image'][0].filename;
        const images = req.files['images'].map(image => image.filename);

        try {
            const connection = await db.getConnection();
            await connection.beginTransaction();

            const product_id = await createProductRecords(req.body, main_image);

            await Promise.all([
                createColorRecords(colors),
                createVariantRecords(variants, product_id),
                createImageRecords(images, product_id)
            ]);

            await connection.commit();
            connection.release();
            res.status(200).json({ message: 'product created' });
        } catch(err) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error(err);
            return res.status(500).json({ error: 'error creating product' });
        } finally {
            next();
        }
    };
    static async getProductDetailsById(req, res) {
        const { id } = req.query;
        try {
            const [product, images, variants] = await Promise.all([
                getProductById(id),
                getImagesByProductId(id),
                getVariantByProductId(id)
            ])
            const colorPromise = variants.map(variant => getColorByCode(variant.color_code));
            const colors = await Promise.all(colorPromise);

            const data = await formProductData(product, images, variants, colors);

            res.status(200).json({ data });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'error getting product details' });
        }
    };
    static async listProducts(req, res) {
        const paging = parseInt(req.query.paging) || 0;
        const category = req.category;
        const endIndex = (paging + 1) * 6;
        const { productNumber } = req;
        try {
            const productRows = await getProductByPageAndCategory(paging, category);
            const data = await formMultipleProductData(productRows);

            if (endIndex < productNumber) {
                return res.status(200).json({
                    data,
                    next_paging: paging + 1
                });
            }
            res.status(200).json({ data });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'error getting products' });
        }
    };
    static async listAllProducts(req, res) {
        req.category = null;
        req.productNumber = await getProductTotalNumber();
        await ProductController.listProducts(req, res);
    };
    static async listMenProducts(req, res) {
        req.category = 'men';
        req.productNumber = await getProductTotalNumber(req.category);
        await ProductController.listProducts(req, res);
    };
    static async listWomenProducts(req, res) {
        req.category = 'women';
        req.productNumber = await getProductTotalNumber(req.category);
        await ProductController.listProducts(req, res);
    };
    static async listAccessoriesProducts(req, res) {
        req.category = 'accessories';
        req.productNumber = await getProductTotalNumber(req.category);
        await ProductController.listProducts(req, res);
    };
    static async searchProducts(req, res) {
        const { keyword } = req.query;
        const paging = parseInt(req.query.paging) || 0;
        const endIndex = (paging + 1) * 6;
        try {
            const productRows = await getProductsByKeyword(keyword, paging);
            const data = await formMultipleProductData(productRows);

            const productTotalNumber = await getProductTotalNumber(null, keyword);
            if (endIndex < productTotalNumber) {
                return res.status(200).json({
                    data,
                    next_paging: paging + 1
                });
            }
            res.status(200).json({ data });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'error getting products' });
        }
    };
    static async deleteProduct(req, res) {
        const { id } = req.query;
        try {
            await deletProductById(id);
            res.status(200).json({ message: 'product deleted' });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'error deleting product' });
        }
    };
    static async recoverProduct(req, res) {
        const { id } = req.query;
        try {
            await recoverProductById(id);
            res.status(200).json({ message: 'product recovered' });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'error recovering product' });
        }
    };
}

module.exports = ProductController;