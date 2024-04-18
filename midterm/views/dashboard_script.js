
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const totalRevenueRes = await fetch('http://54.66.99.63:3333/total-revenue');
        const totalRevenue = await totalRevenueRes.json();
        const totalRevenueData = totalRevenue.total_revenue;
        document.getElementById('totalRevenueValue').textContent = totalRevenueData;

        const pieChart = document.getElementById('pieChart');
        const colorPercentageRes = await fetch('http://54.66.99.63:3333/color-percentage');
        const colorPercentageData = await colorPercentageRes.json();
        let values = [], labels = [], colors = [];
        for (let color of colorPercentageData) {
            values.push(color.product_count);
            labels.push(color.name);
            colors.push(color.code);
        }
        const data = [{ values, labels, type: 'pie', marker: { colors } }];
        const layout = {
            // height: 400,
            // width: 500,
            title: {
                text: 'Product sold percentage in different colors'
            }
        };
        Plotly.newPlot(pieChart, data, layout);

        const histogram = document.getElementById('histogram');
        let x = [];
        const productPriceRes = await fetch('http://54.66.99.63:3333/product-price');
        const productPrice = await productPriceRes.json();
        const productPriceData = productPrice;
        for (let product of productPriceData) {
            const qty = product.qty;
            for (let i = 0; i < qty; i++) {
                x.push(product.price);
            }
        }
        const trace = {x, type: 'histogram'};
        Plotly.newPlot(histogram, [trace], {title: 'Product sold quantity in different price range'});
        
        const barChart = document.getElementById('barChart');
        const topFiveRes = await fetch('http://54.66.99.63:3333/top-five');
        const topFiveData = await topFiveRes.json();
        let x2 = [], ys = [], ym = [], yl = [];
        for (let product of topFiveData) {
            x2.push(`product ${product.id}`);
            ys.push(product.s_qty);
            ym.push(product.m_qty);
            yl.push(product.l_qty);
        }
        let S = { x: x2, y: ys, name: 'S', type: 'bar' };
        let M = { x: x2, y: ym, name: 'M', type: 'bar' };
        let L = { x: x2, y: yl, name: 'L', type: 'bar' };
        Plotly.newPlot(barChart, [L, M, S], {barmode: 'stack', title: 'Quantity of top 5 sold products in different sizes'});


    } catch (error) {
        console.log(error);
    }
})