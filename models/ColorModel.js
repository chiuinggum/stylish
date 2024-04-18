const { db } = require('../config');

class ColorModel {
    static async createColorRecords(colors) {
        try {
            for(let color of colors) {
                const { code, name } = color;
                const [rows] = await db.query('SELECT * FROM colors WHERE code = ?', [code]);
                if(rows.length === 0)
                {
                    await db.query('INSERT INTO colors (code, name) VALUES (?, ?)', [code, name]);
                    console.log(`inserted: ${code}, ${name}`);
                } else {
                    console.log(`already exists: ${code}, ${name}`);
                }
            }
        } catch (err) {
            console.error(err);
            throw new Error('Error inserting color');
        }
    };
    static async getColorByCode(code) {
        try {
            const [colorRow] = await db.query('SELECT * FROM colors WHERE code = ?', [code]);
            if(colorRow.length === 0) {
                throw new Error('Color not found');
            }
            return colorRow[0];
        } catch(err) {
            throw err;
        }
    };
};

module.exports = ColorModel;